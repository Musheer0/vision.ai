import z from "zod";
import { baseProcedure, createTRPCRouter } from "../../init";
import prisma from "@/db";
import { Type } from "@prisma/client";
import { GetUser } from "@/actions/get-user";
import { consumeCredits, RevertCredits } from "@/usage/usage-tracker";
import { getFragmentStatus, setFragmentStatusCache } from "@/redis/redis-client";
import { inngest } from "@/inngest/client";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { CreateSandBox, GetSandBox } from "@/actions/get-sandbox";
import { differenceInMinutes } from "date-fns";
const extractSandboxId = (url: string) => {
  const match = url.match(/https:\/\/\d+-(.+)\.e2b\.app/);
  if (!match) throw new Error("Invalid sandbox URL");
  return match[1];
};
export const FragmentRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        prompt: z.string(),
        vision_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await GetUser();
      const usage = await consumeCredits(user.id);
      if (usage.token_left < 0) throw new Error("You've run out of tokens. Please top up to continue.");

      try {
        const last_ai_message = await prisma.fragment.findFirst({
          where: {
            vision_id: input.vision_id,
            isCompleted: true,
            type: Type.AI,
            agent_summary: { not: null },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        await consumeCredits(user.id);
        const [user_msg, ai_msg] = await prisma.$transaction([
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
              isCompleted: false,
            },
          }),
        ]);

        const memory = {
          summary: last_ai_message?.agent_summary,
          files: last_ai_message?.files,
        };

        console.log(memory);
        await setFragmentStatusCache(ai_msg.id, 'Processing your request... hang tight!');
        await inngest.send({
          name: "ai/code-agent",
          data: {
            prompt: input.prompt,
            memory: memory,
            fragment: ai_msg,
          },
        });

        return {
          fragments: [user_msg, ai_msg],
        };
      } catch (error) {
        console.log(error);
        await RevertCredits(user.id);
        throw new Error("Something went wrong while creating your fragment. Try again.");
      }
    }),

  getFragments: baseProcedure
    .input(z.object({ visionId: z.string() }))
    .query(async ({ input }) => {
      const user = await GetUser();
      const fragments = await prisma.fragment.findMany({
        where: {
          vision_id: input.visionId,
          user_id: user.id,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 20,
      });

      return fragments;
    }),

  pollStatus: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const cache = await getFragmentStatus(input.id);
      console.log(cache, '-------------------------------------');
      if (cache) return cache;

      const fragment = await prisma.fragment.findFirst({
        where: {
          id: input.id,
        },
      });

      return fragment;
    }),

  editFiles: baseProcedure
    .input(
      z.object({
        files: z.array(z.object({ path: z.string(), content: z.string() })),
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
  const { userId } = await auth();
  if (!userId) throw new Error("You're not authorized to do this.");

  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
    select: {
      fragments: {
        where: { id: input.id },
        select: {
          id: true,
          sandBoxCreatedAt: true,
          sandBoxUrl: true,
        },
      },
      id: true,
    },
  });

  if (!user || user.fragments.length === 0) {
    throw new TRPCError({
      message: "Fragment ID is invalid or doesn't belong to you.",
      code: "BAD_REQUEST",
    });
  }

  const fragment = user.fragments[0];

  const sandboxIsFresh =
    fragment.sandBoxCreatedAt &&
    differenceInMinutes(new Date(), fragment.sandBoxCreatedAt) < 3;

  let sandbox;

  try {
    if (sandboxIsFresh && fragment.sandBoxUrl) {
    const sandboxId = extractSandboxId(fragment.sandBoxUrl);
    sandbox = await GetSandBox(sandboxId); // reuse
  } else {
    sandbox = await CreateSandBox(); // create new
  }

  } catch (error) {
        sandbox = await CreateSandBox(); // create new
  }
  // Write all files
  const files: Record<string, string> = {};
  for (const { path, content } of input.files) {
    files[path] = content;
    await sandbox.files.write(path, content);
  }

  const sandboxUrl = `https://${sandbox.getHost(3000)}`;
  const now = new Date();

  const updated = await prisma.fragment.update({
    where: {
      user_id: user.id,
      id: fragment.id,
    },
    data: {
      sandBoxUrl: sandboxUrl,
      sandBoxCreatedAt: now,
      files,
    },
    select: {
      sandBoxUrl: true,
      sandBoxCreatedAt: true,
    },
  });

  return {
    sandbox: {
      url: updated.sandBoxUrl,
      createdAt: updated.sandBoxCreatedAt,
    },
  };
}),
 reloadSandbox: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { userId } = await auth();
      if (!userId) throw new Error("You're not authorized to do this.");

      const user = await prisma.user.findUnique({
        where: { clerk_id: userId },
        select: {
          fragments: {
            where: {
              id: input.id,
            },
            select: {
              id: true,
            },
          },
          id: true,
        },
      });

      if (!user || user?.fragments?.length === 0) {
        throw new TRPCError({ message: "Fragment ID is invalid or doesn't belong to you.", code: "BAD_REQUEST" });
      }

      const sandbox = await CreateSandBox();
      const fragment = await prisma.fragment.update({
        where: {
          user_id: user?.id,
          id: user?.fragments[0].id,
        },
        data: {
          sandBoxCreatedAt: new Date(),
          sandBoxUrl: `https://${sandbox.getHost(3000)}`,
        },
        select: {
          sandBoxUrl: true,
          sandBoxCreatedAt: true,
        },
      });

      return { ...fragment };
    }),
});
