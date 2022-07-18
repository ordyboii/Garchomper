import { createRouter } from "./context";
import superjson from "superjson";
import { z } from "zod";

export const appRouter = createRouter()
  .transformer(superjson)
  .query("get-all-files", {
    input: z.object({
      userId: z.string()
    }),
    resolve: ({ input, ctx }) =>
      ctx.prisma.file.findMany({
        where: { userId: input.userId }
      })
  });

export type AppRouter = typeof appRouter;
