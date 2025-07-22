/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { inngest } from '../client';
import { GetSandBox, GetSandBoxId } from '@/actions/get-sandbox';
import { createAgent, createNetwork, createTool, gemini } from '@inngest/agent-kit';
import { PROMPT } from '../prompt';
import z from 'zod';
import { Fragment, Type } from '@prisma/client';
import {
  deleteFragmentStatus,
  setFragmentStatusCache,
} from '@/redis/redis-client';
import prisma from '@/db';
import { RevertCredits } from '@/usage/usage-tracker';
import { GetReason } from '@/ai-utils/thinker.ai';

export const CodeAgent = inngest.createFunction(
  {  id: 'ai/code-agent' },
  { event: 'ai/code-agent' },
  async ({ event, step }) => {
    const { memory } = event.data;
    const fragment = event.data?.fragment as Fragment;
    if (!fragment) return { error: 'no fragment found' };
    const sandBoxId = await step.run('get-sandbox-id', async () => {
      return GetSandBoxId();
    });
    
    const agent = createAgent({
      name: 'Ai coding agent',
      description: `
        You are a senior software engineer working in a sandboxed Next.js 15.3.3 environment.
        You MUST develop production-ready code. Never put placeholders or mocks, always create the full ready implementation.`,
      model: gemini({ model: 'gemini-2.0-flash'}),
      system: PROMPT,
      assistant:memory?.summary||memory?.files||'this is a brand new project',
      tools: [
        createTool({
          name: 'get_memory',
          description:
            'Use this tool to get memory or context or files of previous convos',
          handler: async () => {
            return memory;
          },
          parameters: undefined,
        }),

        createTool({
          name: 'terminal',
          description: 'Use the terminal to run commands',
          parameters: z.object({ command: z.string() }),
          handler: async ({ command }) => {
            const buffers = { stdout: '', stdErr: '' };
            try {
              const sandbox = await GetSandBox(sandBoxId);
              const result = await sandbox.commands.run(command, {
                onStderr: (data: string) => {buffers.stdErr += data},
                onStdout: (data: string) => {buffers.stdout += data},
              });
              return result.stdout;
            } catch (error: any) {
              return `⚠️ Terminal Error:\n${buffers.stdErr || error?.message}`;
            }
          },
        }),

        createTool({
          name: 'createOrUpdateFiles',
          description: 'Create or update sandbox files',
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          handler: async ({ files }, { step, network }) => {
            const updatedFiles = { ...(network.state.data.files || {}) };
            const newFiles = await step?.run('createorupdateFiles', async () => {
              try {
                const sandbox = await GetSandBox(sandBoxId);
                for (const file of files) {
                  console.log(file.path)
                  await sandbox.files.write(file.path, file.content);
                  if(file.path==='summary.txt'){
                    network.state.data.summary=file.content
                  }
                  updatedFiles[file.path] = file.content;
                }
                return updatedFiles;
              } catch (error) {
                return error;
              }
            });

            if (typeof newFiles === 'object') {
              network.state.data.files = newFiles;
            }
          },
        }),

        createTool({
          name: 'readfiles',
          description: 'Read files from the sandbox',
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }) => {
            try {
              const sandbox = await GetSandBox(sandBoxId);
              const contents = [];
              for (const file of files) {
                const content = await sandbox.files.read(file);
                contents.push({ path: file, content });
              }
              return JSON.stringify(contents);
            } catch (error) {
              return error;
            }
          },
        }),

        createTool({
          name: 'updatedProjectStatus',
          description:
            'Use this tool to update the current project status (e.g., "writing files", "thinking...")',
          parameters: z.object({ status: z.string() }),
          handler: async ({ status }) => {
            try {
              await setFragmentStatusCache(fragment.id, status);
              return status;
            } catch {
              return { status };
            }
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
            const lastMsg = result.output[
                result.output.findLastIndex((msg) => msg.role === 'assistant')
              ]
              if(lastMsg?.type!=='text' ) return result
          const msg = lastMsg?.content
          ?typeof lastMsg?.content==='string'
          ? lastMsg.content as string
          : lastMsg.content.map((c:{text:string})=>c.text).join("") as string
          : undefined;
          if(msg && network){
            if(msg.includes("<task_summary>"))
              network.state.data.summary = msg
          }
          return result;
        },
      },
    });

    const network = createNetwork({
      name: 'code agent network',
      maxIter: 15,
      agents: [agent],
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) return;
        return agent;
      },
    });

 
    try {
      await step.run("loading files",async()=>{
        const sandbox = await GetSandBox(sandBoxId);
        const files = memory?.files||{}
        const keys = Object.keys(files);
        if(keys.length>0){
          for (const key of keys){
            await sandbox.files.write(key,files[key])
          }
        };
        return files
      })
      const better_prompt = await step.run("thinking",async()=>{
        await setFragmentStatusCache(fragment.id, 'thinking...');
        const t = await GetReason(event.data.prompt);
        return t
      })
      const result = await network.run(JSON.stringify({better_prompt, original:event.data.prompt}));
      const isError =
      !result.state.data.files ||
      Object.keys(result.state.data.files || {}).length === 0;
      
      if (isError) {
      throw new Error("agent error")
    }
      const summary = result.state.data?.summary as string;
   const data: { user: string; ai: string } = (() => {
 try {
    // Try markdown-style code block with json
    const jsonString = summary.split('```json')[1].split('```')[0];
    return JSON.parse(jsonString);
  } catch (error1) {
    try {
      // Try XML-style <task_summary> wrapped JSON
      const xmlWrapped = summary.replace('<task_summary>', '').replace('</task_summary>', '');
      return JSON.parse(xmlWrapped);
    } catch (error2) {
      try {
        // Try if it's wrapped in backticks with tags, like ```<task_summary>{...}</task_summary>```
        const codeBlock = summary.split('```')[1]; // no json, just triple backticks
        const inner = codeBlock.replace('<task_summary>', '').replace('</task_summary>', '');
        return JSON.parse(inner);
      } catch (finalErr) {
        console.error('back tick parsing failed ', finalErr);
        try {
          const match = summary.match(/<task_summary>\s*([\s\S]*?)\s*<\/task_summary>/); 
          if(match){
            const m = match[0].replace('<task_summary>','').replace('</task_summary>','')
          return JSON.parse(match[0].replace('<task_summary>','').replace('</task_summary>',''))}
          return { user: '', ai: '' }; // Final fallback so app doesn't explode
        } catch (error) {

          return { user: '', ai: '' }; // Final fallback so app doesn't explode
        }
      }
    }
  }
})();

           const sandbox = await GetSandBox(sandBoxId);
             await step.run("writing file",async()=>{
        const files = result.state.data.files||{}
        const keys = Object.keys(files);
        if(keys.length>0){
          for (const key of keys){
            await sandbox.files.write(key,files[key])
          }
        };
        return files
      })
      await prisma.fragment.update({
        where: { id: fragment.id },
        data: {
          isCompleted: true,
          status: 'completed',
          user_summary: data.user,
          agent_summary: data.ai,
          files: result.state.data.files,
          sandBoxUrl: `https://${sandbox.getHost(3000)}`,
          sandBoxCreatedAt: new Date(),
          type:Type.AI
        },
      });
      await deleteFragmentStatus(fragment.id);
      return { summary:data, id: sandBoxId ,url:`https://${sandbox.getHost(3000)}`};
    } catch (error) {
      await prisma.fragment.update({
        where: { id: fragment.id },
        data: {
          isCompleted: true,
          error: 'Error creating your vision',
          type: Type.ERROR,
          status: 'failed',
        },
      });
      await deleteFragmentStatus(fragment.id);
      await RevertCredits(fragment.user_id);
      return { error};
    }

  },
);
