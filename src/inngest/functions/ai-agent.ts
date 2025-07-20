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
import { consumeCredits, RevertCredits } from '@/usage/usage-tracker';

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
      model: gemini({ model: 'gemini-2.0-flash' }),
      system: PROMPT,
      tools: [
        createTool({
          name: 'get_memory',
          description:
            'Use this tool to get memory or context or files of previous convos',
          handler: async ({}, { network }) => {
                const sandbox = await GetSandBox(sandBoxId);
          if (memory?.files) {
          const keys = Object.keys(memory.files);
      for (const key of keys) {
        await sandbox.files.write(key, memory.files[key]);
      }
    }
            if (memory?.files) network.state.data.files = memory.files;
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
                  await sandbox.files.write(file.path, file.content);
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
            } catch (error) {
              console.log(error);
              return { status };
            }
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
            const lastMsg = result.output[
                result.output.findIndex((msg) => msg.role === 'assistant')
                // @ts-ignore
          ]?.content;

          if (lastMsg && network) {
            let msg = '';
            if (typeof lastMsg === 'string') {
              msg = lastMsg;
            } else {
              msg = lastMsg.map((c: { text: string }) => c.text).join('');
            }

            if (msg.includes('<task_summary>')) {
              network.state.data.summary = msg;
            }
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
         // Load memory files
     
          const usage = await step.run("cosume-creadtis", async()=>{
            return await consumeCredits(fragment.user_id);
          })
          if (usage.token_left < 0) throw new Error("Token exhausted");

       const result = await network.run(event.data.prompt);
    const isError =
      !result.state.data.files ||
      Object.keys(result.state.data.files || {}).length === 0;

    if (isError) {
      console.log(result.state.data);
      throw new Error("agent error")
    }
      const summary = result.state.data?.summary as string;
      const data: { user: string; ai: string } =  JSON.parse( summary.split('```json')[1].split('```')[0]);
           const sandbox = await GetSandBox(sandBoxId);
         sandbox.setTimeout(3600000)
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
      return { summary: result.state.data?.summary, id: sandBoxId ,url:`https://${sandbox.getHost(3000)}`};
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
      console.log(error)
      return { error};
    }

  },
);
