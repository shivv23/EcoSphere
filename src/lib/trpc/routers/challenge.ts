import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const challengeRouter = router({
  list: protectedProcedure.input(z.object({ status: z.enum(["DRAFT", "ACTIVE", "UNDER_REVIEW", "COMPLETED", "ARCHIVED"]).optional() }).optional()).query(async ({ ctx, input }) => {
    const where: any = {};
    if (input?.status) where.status = input.status;
    return ctx.db.challenge.findMany({ where, include: { category: true, _count: { select: { participations: true } } }, orderBy: { deadline: "asc" } });
  }),
  create: protectedProcedure.input(z.object({ title: z.string().min(1), description: z.string().min(1), categoryId: z.string(), xpReward: z.number().min(0).default(100), difficulty: z.string().default("Medium"), evidenceRequired: z.boolean().default(false), deadline: z.date(), maxParticipants: z.number().optional() })).mutation(async ({ ctx, input }) => {
    return ctx.db.challenge.create({ data: input });
  }),
  update: protectedProcedure.input(z.object({ id: z.string() }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    return ctx.db.challenge.update({ where: { id }, data });
  }),
  participate: protectedProcedure.input(z.object({ challengeId: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.challengeParticipation.upsert({
      where: { employeeId_challengeId: { employeeId: ctx.user.id, challengeId: input.challengeId } },
      create: { employeeId: ctx.user.id, challengeId: input.challengeId },
      update: {},
    });
  }),
  approve: protectedProcedure.input(z.object({ id: z.string(), status: z.enum(["APPROVED", "REJECTED"]), xpAwarded: z.number().optional() })).mutation(async ({ ctx, input }) => {
    const participation = await ctx.db.challengeParticipation.update({ where: { id: input.id }, data: { status: input.status, xpAwarded: input.xpAwarded || 0, completedAt: input.status === "APPROVED" ? new Date() : null } });
    if (input.status === "APPROVED" && input.xpAwarded) {
      await ctx.db.user.update({ where: { id: participation.employeeId }, data: { xp: { increment: input.xpAwarded } } });
    }
    return participation;
  }),
  stats: protectedProcedure.query(async ({ ctx }) => {
    const total = await ctx.db.challenge.count();
    const active = await ctx.db.challenge.count({ where: { status: "ACTIVE" } });
    const completed = await ctx.db.challenge.count({ where: { status: "COMPLETED" } });
    const totalParticipants = await ctx.db.challengeParticipation.count();
    return { total, active, completed, totalParticipants };
  }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.challenge.delete({ where: { id: input.id } });
  }),
});
