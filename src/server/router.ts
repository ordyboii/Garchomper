import { createProtectedRouter } from "./context";
import { z } from "zod";

export const appRouter = createProtectedRouter()
  .query("get-all-files", {
    resolve: ({ ctx }) =>
      ctx.prisma.file.findMany({
        where: { userId: ctx.user.id }
      })
  })
  .mutation("upload-files", {
    input: z
      .object({
        content: z.string(),
        type: z.enum(["PDF", "IMAGE"]),
        name: z.string()
      })
      .array(),
    resolve: ({ input, ctx }) =>
      ctx.prisma.file.createMany({
        data: input.map(file => ({
          content: file.content,
          type: file.type,
          name: file.name,
          userId: ctx.user.id
        }))
      })
  });
