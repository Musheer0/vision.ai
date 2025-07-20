import {createTRPCRouter } from '../init';
import { VisionRouter } from './vision/procedure';
import { FragmentRouter } from './fragment/procedure';
import { TokenRouter } from './token/procedure';
export const appRouter = createTRPCRouter({
  vision:VisionRouter,
  fragment:FragmentRouter,
  token:TokenRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;