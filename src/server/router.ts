import { createProtectedRouter } from "./context";
import superjson from "superjson";
import { z } from "zod";

export const appRouter = createProtectedRouter()
  .transformer(superjson)
  .query("get-all-files", {
    input: z.object({
      userId: z.string()
    }),
    resolve: ({ input, ctx }) =>
      ctx.prisma.file.findMany({
        where: { userId: input.userId }
      })
  })
  .mutation("upload-files", {
    input: z.object({
      content: z.string().array()
    }),
    resolve: ({ input, ctx }) =>
      ctx.prisma.file.createMany({
        data: input.content.map(file => ({
          content: file,
          userId: ctx.user.id
        }))
      })
  });

export type AppRouter = typeof appRouter;
