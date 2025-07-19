import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { VisionRouter } from './vision/procedure';
import { FragmentRouter } from './fragment/procedure';
export const appRouter = createTRPCRouter({
  vision:VisionRouter,
  fragment:FragmentRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;