import prisma from "@/db";
import { auth } from "@clerk/nextjs/server";

export const GetUser = async()=>{
     const {userId} = await auth();
    if(!userId) throw new Error("Un authorized");
    const user = await prisma.user.findFirst({
        where:{clerk_id:userId}
    });
    if(!user) throw new Error("Un authorized");
    return user
}