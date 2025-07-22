import { Sandbox } from '@e2b/code-interpreter'

export const GetSandBoxId = async()=>{
    const sandbox = await Sandbox.create(process.env.E2B_TEMPLATE!);
    return sandbox.sandboxId;
}

export const CreateSandBox = async()=>{
    const sandbox = await Sandbox.create(process.env.E2B_TEMPLATE!);
    return sandbox
}

export const GetSandBox = async(id:string)=>{
    return await Sandbox.connect(id);
}