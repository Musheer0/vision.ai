import { Reason_modelPrompt } from '@/lib/prompts';
import { Groq } from 'groq-sdk';
const groq = new Groq({ apiKey:process.env.REASON});
export const GetReason = async(prompt:string, memory?:string)=>{
    try {
        const reason = await groq.chat.completions.create({
        messages:[
            {
                role: "system",
                content:Reason_modelPrompt
            },
    {
    role: "assistant",
    content:'previous memory:'+ memory||'None'
  },
            {
                role: 'user',
                content:prompt
            },
           
        ],
        model:"meta-llama/llama-4-scout-17b-16e-instruct",
        temperature:0.1
    });
    return reason.choices[0].message.content||prompt
    } catch (error) {
        console.log(error);
        return prompt
    }
}