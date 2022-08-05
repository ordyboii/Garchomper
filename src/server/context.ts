import * as trpc from "@trpc/server";
import { inferAsyncReturnType } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { prisma } from "./db";
import { getGarchomperAuth } from "./auth";
import superjson from "superjson";

export async function createContext(ctx: CreateNextContextOptions) {
  const session = await getGarchomperAuth(ctx);
  return { prisma, session };
}

export function createProtectedRouter() {
  return trpc
    .router<inferAsyncReturnType<typeof createContext>>()
    .transformer(superjson)
    .middleware(({ ctx, next }) => {
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
}
