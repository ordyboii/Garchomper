import { appRouter } from "@/server/router";
import { createReactQueryHooks } from "@trpc/react";
import { inferProcedureOutput } from "@trpc/server";

export const trpc = createReactQueryHooks<typeof appRouter>();

export type InferQueryOutput<
  TRouteKey extends keyof typeof appRouter["_def"]["queries"]
> = inferProcedureOutput<typeof appRouter["_def"]["queries"][TRouteKey]>;
