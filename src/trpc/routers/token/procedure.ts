import prisma from "@/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { auth } from "@clerk/nextjs/server";

export const TokenRouter = createTRPCRouter({
    usage:baseProcedure
    .query(async()=>{
        const {userId} = await auth();
        if(!userId) throw new Error("Un authorized");
        const usage = await prisma.user.findFirst({
            where:{
                clerk_id:userId
            },
            select:{
                usage:true
            }
        });
        if(!usage?.usage) throw new Error("Invalid accound ");
        return usage.usage
    })
})