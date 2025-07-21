import z from "zod";
import { baseProcedure, createTRPCRouter } from "../../init";
import { GetUser } from "@/actions/get-user";
import { consumeCredits, RevertCredits } from "@/usage/usage-tracker";
import prisma from "@/db";
import { GenerateTitle } from "@/actions/generate-title";
import { Type } from "@prisma/client";
import { inngest } from "@/inngest/client";
import { setFragmentStatusCache } from "@/redis/redis-client";
/**
 * VisionRouter - Handles CRUD operations for visions.
 *
 * This includes:
 * - Creating a new vision (consumes user credits, calls AI to generate a title)
 * - Deleting a vision (no credit refund)
 * - Fetching a single vision by ID
 * - Fetching all visions for the authenticated user
 */

export const VisionRouter = createTRPCRouter({
  /**
   * Create a new vision with AI title generation and two default fragments.
   * 
   * - Deducts 1 credit (reverted if any error occurs after consumption)
   * - Generates a title using the prompt
   * - Creates a new vision in DB
   * - Creates two fragments (USER + AI type)
   * 
   * @throws {Error} If unauthorized, out of tokens, or creation fails.
   * 
   * @input { prompt: string }
   * @returns {{
   *   vision: Vision,
   *   fragments: Fragment[],
   *   warning: string | null
   * }}
   */
  create: baseProcedure
    .input(
      z.object({
        prompt: z.string().min(1, "Prompt cannot be empty"),
      })
    )
   .mutation(async ({ input }) => {
  let user;

  try {
    user = await GetUser(); // only auth logic here
  } catch (authError) {
    console.error("Auth error:", authError);
    throw new Error("Unauthorized");
  }

  let usage;
  try {
    usage = await consumeCredits(user.id);
    if (usage.token_left < 0) throw new Error("Token exhausted");
  } catch (creditsError) {
    console.error("Credit system error:", creditsError);
    throw new Error("Token exhausted");
  }

  try {
    const title = await GenerateTitle(input.prompt);
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
          isCompleted:false
        },
      }),
    ]);
await setFragmentStatusCache(ai_fragment.id, 'processing your request...')
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
      warning:
        usage.token_left === 0 ? "warning: you have 0 tokens left" : null,
    };
  } catch (apiError) {
    console.error("Vision creation error:", apiError);
    try {
      await RevertCredits(user.id);
    } catch (revertError) {
      console.error("Failed to revert credits:", revertError);
    }
    throw new Error("Error creating vision");
  }
}),
  /**
   * Deletes a vision by ID.
   * 
   * ⚠️ Does NOT refund consumed credits.
   * 
   * @input { visionId: string }
   * @returns {{ success: boolean, message: string }}
   * @throws {Error} If unauthorized or vision not found.
   */
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
          throw new Error("Vision not found or access denied");
        }

        await prisma.vision.delete({
          where: { id: input.visionId },
        });

        return { success: true, message: "Vision deleted successfully" };
      } catch (error) {
        console.error("Vision deletion error:", error);
        throw new Error("Failed to delete vision");
      }
    }),

  /**
   * Fetch a vision by ID for the authenticated user.
   * 
   * @input { visionId: string }
   * @returns { Vision }
   * @throws {Error} If unauthorized or vision not found.
   */
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
          throw new Error("Vision not found or access denied");
        }

        return vision;
      } catch (error) {
        console.error("GetVisionById error:", error);
        throw new Error("Failed to fetch vision");
      }
    }),

  /**
   * Fetch all visions for the authenticated user.
   * 
   * @returns { Vision[] }
   * @throws {Error} If unauthorized or DB query fails.
   */
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
      throw new Error("Failed to fetch visions");
    }
  }),
});
