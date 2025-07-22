import prisma from "@/db";
export const consumeCredits = async (userId: string) => {
    console.log('cosuming ---------------------------------------------------------------------')
  const usage = await prisma.usage.findUnique({
    where: { user_id: userId },
  });

  if (!usage || usage.token_left <= 0) {
    throw new Error("No tokens left to consume");
  }

  return await prisma.usage.update({
    where: { user_id: userId },
    data: {
      token_left: { decrement: 3 },
    },
  });
};
export const RevertCredits = async(userId:string)=>{
     const usage = await prisma.usage.update({
        where:{
            user_id:userId,
        },
        data:{
        token_left: {increment:2}
        }
    });
    return usage;
}