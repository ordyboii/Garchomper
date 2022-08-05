import { createProtectedRouter } from "./context";
import { z } from "zod";

export const appRouter = createProtectedRouter()
  .query("get-all-files", {
    resolve: ({ ctx }) =>
      ctx.prisma.file.findMany({
        where: { userId: ctx.user.id }
      })
  })
  .query("get-file-by-id", {
    input: z.object({
      id: z.string()
    }),
    resolve: ({ input, ctx }) =>
      ctx.prisma.file.findUnique({
        where: { id: input.id }
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
  })
  .mutation("delete-file", {
    input: z.object({
      id: z.string()
    }),
    resolve: ({ input, ctx }) =>
      ctx.prisma.file.delete({
        where: { id: input.id }
      })
  });
