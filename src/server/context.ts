import * as trpc from "@trpc/server";
import { inferAsyncReturnType } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { prisma } from "./db";
import { getGarchomperAuth } from "./auth";

export const createContext = async (ctx: CreateNextContextOptions) => {
  const session = await getGarchomperAuth(ctx);
  return { prisma, session };
};

type Context = inferAsyncReturnType<typeof createContext>;

export const createProtectedRouter = () =>
  trpc.router<Context>().middleware(({ ctx, next }) => {
    if (!ctx.session) {
      throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        ...ctx,
        // infers that `user` is non-nullable to downstream procedures
        user: ctx.session.user
      }
    });
  });
