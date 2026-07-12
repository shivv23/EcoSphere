import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const csrActivityRouter = router({
  list: protectedProcedure.input(z.object({ departmentId: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
    const where: any = {};
    if (input?.departmentId) where.departmentId = input.departmentId;
    return ctx.db.cSRActivity.findMany({ where, include: { department: true, category: true, organizer: true, _count: { select: { participations: true } } }, orderBy: { date: "desc" } });
  }),
  create: protectedProcedure.input(z.object({ title: z.string().min(1), description: z.string().min(1), departmentId: z.string(), categoryId: z.string(), location: z.string().optional(), date: z.date().optional() })).mutation(async ({ ctx, input }) => {
    return ctx.db.cSRActivity.create({ data: { ...input, organizerId: ctx.user.id } });
  }),
  approve: protectedProcedure.input(z.object({ id: z.string(), status: z.enum(["APPROVED", "REJECTED"]) })).mutation(async ({ ctx, input }) => {
    return ctx.db.cSRActivity.update({ where: { id: input.id }, data: { status: input.status } });
  }),
  stats: protectedProcedure.query(async ({ ctx }) => {
    const total = await ctx.db.cSRActivity.count();
    const pending = await ctx.db.cSRActivity.count({ where: { status: "PENDING" } });
    const approved = await ctx.db.cSRActivity.count({ where: { status: "APPROVED" } });
    const totalParticipations = await ctx.db.employeeParticipation.count();
    return { total, pending, approved, totalParticipations };
  }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.cSRActivity.delete({ where: { id: input.id } });
  }),
});
