import z from "zod";
import { baseProcedure, createTRPCRouter } from "../../init";
import prisma from "@/db";
import { Type } from "@prisma/client";
import { GetUser } from "@/actions/get-user";
import { consumeCredits, RevertCredits } from "@/usage/usage-tracker";

export const FragmentRouter = createTRPCRouter({
    create :baseProcedure
    .input(
        z.object({
            prompt:z.string(),
            last_ai_id:z.string(),
            vision_id:z.string(),
        })
    )
    .mutation(async({input})=>{
        const user = await GetUser();
         const usage = await consumeCredits(user.id);
                  if (usage.token_left < 0) throw new Error("Token exhausted");
       try {
         const last_ai_message = await prisma.fragment.findFirst({
            where:{
                id:input.last_ai_id,
                vision_id:input.vision_id,
                isCompleted:true,
                type:Type.AI,
                agent_summary: {not:null}
            }
        });
        const [user_msg ,ai_msg]=await  prisma.$transaction([
              prisma.fragment.create({
                            data: {
                              user_id: user.id,
                              vision_id: input.vision_id,
                              name: input.prompt,
                              files: {},
                              type: Type.USER,
                            },
                          }),
                          prisma.fragment.create({
                            data: {
                              user_id: user.id,
                              vision_id: input.vision_id,
                              name: input.prompt,
                              files: {},
                              type: Type.AI,
                            },
                          }),
        ]);
        //TODO SEND INGEST
        const memory ={
            summary: last_ai_message?.agent_summary,
            files : last_ai_message?.files
        }
        return {
            fragments: [user_msg,ai_msg]
        }
       } catch (error) {
         await RevertCredits(user.id);
       }
    }),
    getFragments :baseProcedure
    .input(z.object({ visionId: z.string() }))
    .query(async ({ input }) => {
      const user = await GetUser()
      const fragments = await prisma.fragment.findMany({
        where: {
          vision_id: input.visionId,
          user_id: user.id
        },
        orderBy: {
          createdAt: "asc", 
        },
        take: 20,
      });

      return fragments;
    }),
})
