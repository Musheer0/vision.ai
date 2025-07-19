import { Sandbox } from '@e2b/code-interpreter'

export const GetSandBoxId = async()=>{
    console.log(process.env.E2B_TEMPLATE!)
    const sandbox = await Sandbox.create(process.env.E2B_TEMPLATE!);
    return sandbox.sandboxId;
}

export const GetSandBox = async(id:string)=>{
    return await Sandbox.connect(id);
}