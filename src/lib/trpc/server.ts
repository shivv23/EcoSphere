import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export async function createTRPCContext() {
  const session = await auth();
  return {
    db,
    session,
    user: session?.user as any,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: { ...ctx, user: ctx.user },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceAuth);
