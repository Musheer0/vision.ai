
import Groq from "groq-sdk";
const groq = new Groq({ apiKey:process.env.TITLE });

async function main(prompt:string) {
  const completion = await groq.chat.completions
    .create({
      messages: [
        {
          role: "user",
          content: prompt
        },
        {
          role:"system",
          content:`
          You are a professional branding assistant tasked with naming tech products and services. Your job is to generate a *formal*, *concise*, and *professional* title for a company project based on the user’s description.

Guidelines:
- The title must be short, ideally 3–7 words max.
- Avoid buzzwords, marketing fluff, or dramatic slogans.
- Do not include punctuation like colons unless it's subtle and meaningful.
- Make the title sound trustworthy and enterprise-ready.
- Prioritize clarity and relevance over creativity.
- Incorporate the brand or company name naturally if it fits.

Return ONLY the title. No explanations. No extra words.

          `
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature:0.1
    })
    .then((chatCompletion) => {
      return chatCompletion.choices[0]?.message?.content || prompt
    });
    return completion
}

export const createTitle  =async(prompt:string)=>{
    try {
        return main(prompt)
    } catch  {
        return prompt
    }
}