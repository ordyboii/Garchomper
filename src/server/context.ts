import * as trpc from "@trpc/server";
import { inferAsyncReturnType } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { prisma } from "./db";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const createContext = async ({ req, res }: CreateNextContextOptions) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  return { req, res, prisma, session };
};

type Context = inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();

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
