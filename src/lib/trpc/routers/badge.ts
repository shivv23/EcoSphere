import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const badgeRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.badge.findMany({ include: { _count: { select: { assignments: true } } }, orderBy: { xpThreshold: "asc" } });
  }),
  create: protectedProcedure.input(z.object({ name: z.string().min(1), description: z.string().min(1), icon: z.string().default("🏅"), xpThreshold: z.number().default(0), challengeThreshold: z.number().default(0), tier: z.string().default("Bronze") })).mutation(async ({ ctx, input }) => {
    return ctx.db.badge.create({ data: input });
  }),
  update: protectedProcedure.input(z.object({ id: z.string() }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    return ctx.db.badge.update({ where: { id }, data });
  }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.badge.delete({ where: { id: input.id } });
  }),
});
