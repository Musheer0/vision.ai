import z from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure, createTRPCRouter } from "../../init";
import { GetUser } from "@/actions/get-user";
import { consumeCredits, RevertCredits } from "@/usage/usage-tracker";
import prisma from "@/db";
import { Type } from "@prisma/client";
import { inngest } from "@/inngest/client";
import { setFragmentStatusCache } from "@/redis/redis-client";
import { createTitle } from "@/ai-utils/title-generator";

export const VisionRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        prompt: z.string().min(1, "Prompt cannot be empty"),
      })
    )
    .mutation(async ({ input }) => {
      let user;

      try {
        user = await GetUser();
      } catch (authError) {
        console.error("Auth error:", authError);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You're not logged in or your session expired.",
        });
      }

      let usage;
      try {
        usage = await consumeCredits(user.id);
        if (usage.token_left < 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You’ve run out of tokens. Please top up to create a vision.",
          });
        }
      } catch (creditsError) {
        console.error("Credit system error:", creditsError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check token balance.",
        });
      }

      try {
        const title = await createTitle(input.prompt);
        const vision = await prisma.vision.create({
          data: {
            name: title,
            user_id: user.id,
          },
        });

        const [user_fragment, ai_fragment] = await prisma.$transaction([
          prisma.fragment.create({
            data: {
              user_id: user.id,
              vision_id: vision.id,
              name: input.prompt,
              files: {},
              type: Type.USER,
            },
          }),
          prisma.fragment.create({
            data: {
              user_id: user.id,
              vision_id: vision.id,
              name: input.prompt,
              files: {},
              type: Type.AI,
              isCompleted: false,
            },
          }),
        ]);

        await setFragmentStatusCache(ai_fragment.id, "Processing your request...");

        await inngest.send({
          name: "ai/code-agent",
          data: {
            prompt: input.prompt,
            memory: null,
            fragment: ai_fragment,
          },
        });

        return {
          vision,
          fragments: [user_fragment, ai_fragment],
          warning: usage.token_left === 0 ? "Warning: You’ve used up all your tokens." : null,
        };
      } catch (apiError) {
        console.error("Vision creation error:", apiError);
        try {
          await RevertCredits(user.id);
        } catch (revertError) {
          console.error("Failed to revert credits:", revertError);
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while creating your vision. Please try again.",
        });
      }
    }),

  delete: baseProcedure
    .input(
      z.object({
        visionId: z.string().min(1, "Vision ID is required"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const user = await GetUser();

        const vision = await prisma.vision.findUnique({
          where: { id: input.visionId },
        });

        if (!vision || vision.user_id !== user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "This vision either doesn't exist or you don’t have access to it.",
          });
        }

        await prisma.vision.delete({
          where: { id: input.visionId },
        });

        return { success: true, message: "Vision deleted successfully." };
      } catch (error) {
        console.error("Vision deletion error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not delete vision. Please try again.",
        });
      }
    }),

  getById: baseProcedure
    .input(
      z.object({
        visionId: z.string().min(1, "Vision ID is required"),
      })
    )
    .query(async ({ input }) => {
      try {
        const user = await GetUser();

        const vision = await prisma.vision.findFirst({
          where: {
            id: input.visionId,
            user_id: user.id,
          },
        });

        if (!vision) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Vision not found or you're not allowed to access it.",
          });
        }

        return vision;
      } catch (error) {
        console.error("GetVisionById error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not fetch vision. Something broke.",
        });
      }
    }),

  getAll: baseProcedure.query(async () => {
    try {
      const user = await GetUser();

      const visions = await prisma.vision.findMany({
        where: {
          user_id: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return visions;
    } catch (error) {
      console.error("GetAllVisions error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to load your visions. Please try again later.",
      });
    }
  }),
});
