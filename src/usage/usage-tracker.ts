import prisma from "@/db";

export const  consumeCredits = async (userId:string)=>{

    const usage = await prisma.usage.update({
        where:{
            user_id:userId,
            token_left: {gt:0}
        },
        data:{
        token_left: {decrement:1}
        }
    });
    return usage;
};

export const RevertCredits = async(userId:string)=>{
     const usage = await prisma.usage.update({
        where:{
            user_id:userId,
        },
        data:{
        token_left: {increment:1}
        }
    });
    return usage;
}