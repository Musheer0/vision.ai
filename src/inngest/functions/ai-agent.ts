/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment*/
import { inngest } from "../client";
import { GetSandBox, GetSandBoxId } from "@/actions/get-sandbox";
import {createAgent, createNetwork, createTool} from '@inngest/agent-kit'
import { gemini } from "@inngest/agent-kit";
import { PROMPT } from "../prompt";
import z from "zod";
import { Fragment } from "@prisma/client";
export const CodeAgent = inngest.createFunction(
    {name:'code-agent', id:'code-agent'},
    {event:'ai/code-agent'},
    async({event,step})=>{
        const {memory} = event.data;
        const fragment = event.data?.fragment as Fragment
        console.log(fragment)
        const sandBoxId = await step.run("get-sandbox-id",async()=>{
            return GetSandBoxId()
        });
        //Initialize files
        const agent = createAgent(
            {
                name: 'Ai coding agent',
                description:  `
                You are a senior software engineer working in a sandboxed Next.js 15.3.3 environment.
                You MUST develop production-ready code. Never put placeholders or mocks, always create the full ready implementation, production-ready`,
                model: gemini({
                    model: 'gemini-2.0-flash'
                }),
                system: PROMPT,
                tools:[
                    /**
                     * Memory Tool
                     * use this tool to send prvious chat memory to ai agent 
                     */
                    createTool({
                        name: 'get_memory',
                        description: 'use this tool to get the memory or context or files of previous convos',
                        handler: async({},{ network})=>{
                            if(memory?.files) network.state.data.files = memory.files
                            return memory
                        },
                        parameters:undefined
                    }),
                    /**
                     * Terminal Tool
                     * @params {command:string}
                     * use this tool to run command
                     */
                    createTool({
                           name:"terminal",
                           description:"Use the terminal to run commands",
                          parameters: z.object({
                                    command:z.string()
                                    }),
                          handler: async({command})=>{
                                const buffers = {stdout: "", stdErr: ""};
                                try {
                                            const sandbox = await GetSandBox(sandBoxId);
                                            const result = await sandbox.commands.run(command,{
                                                onStderr:(data:string)=>{
                                                    buffers.stdErr+=data
                                                },
                                                onStdout:(data)=>{
                                                    buffers.stdout+=data
                                                }
                                            });
                                            return result.stdout
                                } catch (error:any) {
                                return `⚠️ Terminal Error:\n${buffers.stdErr || error?.message }`
                                }
                          }
                    }),
                    /**
                     * Create or update files
                     * @params files:{path:string ,content:string}[],
                     * use this tool to update or write files in the sandbox and updated the network state
                     */
                    createTool({
                        name:'createOrUpdateFiles',
                        description:'create or updated files of the sandbox',
                        parameters: z.object({
                            files :z.array(
                                z.object({
                                    path:z.string(),
                                    content:z.string()
                                })
                            )
                        }),
                        handler:async({files}, {step, network})=>{
                        const updatedFiles = {...(network.state.data.files || {})}; // clone the state
                        const newFiles = await step?.run("createorupdateFiles",async()=>{
                            const sandbox = await GetSandBox(sandBoxId)
                            try {
                                                            for (const file of files){
                                await sandbox.files.write(file.path, file.content);
                                updatedFiles[file.path] = file.content;
                            }
                            return updatedFiles
                            } catch (error) {
                                return error
                            }
                        });
                          if(typeof newFiles==='object'){
                            network.state.data.files =newFiles
                        }
                        }

                    }),
                        /**
                     * read  files
                     * @params files:string[],
                     * use this tool to read  files in the sandbox 
                     */
                      createTool({
                     name:'readfiles',
                       description: 'read files from the sandbox',
                       parameters:z.object({
                         files: z.array(z.string())
                           }),
                        handler:async({files})=>{
                        try {
                        const sandbox = await GetSandBox(sandBoxId);
                          const contents = [];
                           for (const file of files) {
                          const   content = await sandbox.files.read(file)
                             contents.push({path:file, content});
                             }
                             return JSON.stringify(contents)
                            } catch (error) {
                              return error
                                }
                             }
                           }),
                             /**
                     * update status
                     * @params status:string,
                     * use this tool to updated progress status 
                     */
                             createTool({
                                               name: 'updatedProjectStatus',
                                               description: 'use this tool to update the current project status like thinking..., writing files, fixing bugs, edit page.tsx etc etc no need to brief just small oneliner ',
                                               parameters:z.object({
                                                   status:z.string()
                                               }),
                                               handler:async({status})=>{
                                                  try {
                                                   console.log(status)
                                                  } catch (error) {
                                                   console.log(error)
                                                  }
                                                   return {status}
                                               }
                                           }),
                ],
                //if out has <task_summary> return nothing to end loop
                //else continue
                  lifecycle:{
                onResponse:async({result, network})=>{
                    const lastMsg = 
                    //@ts-ignore
                    result.output[result.output.findIndex((msg)=>msg.role==='assistant')]?.content;
                    if(lastMsg && network){
                        let msg = ''
                        if(typeof lastMsg==='string'){
                        msg = lastMsg
                        }
                        else{
                            msg = lastMsg.map((c:{text:string})=>c.text).join("")
                        }
                        if(msg.includes('<task_summary>')){
                            console.log(msg,'-----------------------')
                            network.state.data.summary = msg;
                        
                        }
                    };
                    return result

                }
            },
            }
        );
        const network = createNetwork({
            name: 'code agent network',
            maxIter:15,
            agents:[agent],
            router:async({network})=>{
                const summary = network.state.data.summary;
                console.log(summary, '-------------------------------------------')
                if(summary) return;
                return agent
            },
        });
        //Load files
        if(memory && memory?.files){
            const sandbox = await GetSandBox(sandBoxId)
              const keys = Object.keys(memory.files);
            for (const key of keys)
            await sandbox.files.write(key, memory.files[key])
        };
        const result = await network.run(event.data.prompt);
        const isError = !result.state.data.files ||Object.keys(result.state.data.files||{}).length===0;
        console.log(result.state.data?.summary, isError)
        return {summary:result.state.data?.summary, id:sandBoxId}
    }
)