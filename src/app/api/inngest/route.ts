import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { CodeAgent } from "@/inngest/functions/ai-agent";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    CodeAgent
  ],
});