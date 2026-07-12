import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const rewardRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.reward.findMany({ orderBy: { pointsRequired: "asc" } });
  }),
  create: protectedProcedure.input(z.object({ name: z.string().min(1), description: z.string().min(1), pointsRequired: z.number().positive(), stock: z.number().min(0).default(0), category: z.string().default("General") })).mutation(async ({ ctx, input }) => {
    return ctx.db.reward.create({ data: input });
  }),
  update: protectedProcedure.input(z.object({ id: z.string() }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    return ctx.db.reward.update({ where: { id }, data });
  }),
  redeem: protectedProcedure.input(z.object({ rewardId: z.string() })).mutation(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({ where: { id: ctx.user.id } });
    const reward = await ctx.db.reward.findUnique({ where: { id: input.rewardId } });
    if (!user || !reward) throw new Error("Not found");
    if (reward.stock <= 0) throw new Error("Out of stock");
    if (user.xp < reward.pointsRequired) throw new Error("Insufficient points");
    return ctx.db.$transaction([
      ctx.db.user.update({ where: { id: ctx.user.id }, data: { xp: { decrement: reward.pointsRequired } } }),
      ctx.db.reward.update({ where: { id: input.rewardId }, data: { stock: { decrement: 1 } } }),
      ctx.db.rewardRedemption.create({ data: { employeeId: ctx.user.id, rewardId: input.rewardId, pointsSpent: reward.pointsRequired } }),
    ]);
  }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.reward.delete({ where: { id: input.id } });
  }),
});
