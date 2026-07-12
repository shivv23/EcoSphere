import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";
import { checkAndAwardBadges, calculateDepartmentScores } from "@/lib/scoring";

export const csrActivityRouter = router({
  list: protectedProcedure.input(z.object({ departmentId: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
    const where: any = {};
    if (input?.departmentId) where.departmentId = input.departmentId;
    return ctx.db.cSRActivity.findMany({ where, include: { department: true, category: true, organizer: true, _count: { select: { participations: true } } }, orderBy: { date: "desc" } });
  }),
  create: protectedProcedure.input(z.object({ title: z.string().min(1), description: z.string().min(1), departmentId: z.string(), categoryId: z.string(), location: z.string().optional(), date: z.date().optional() })).mutation(async ({ ctx, input }) => {
    return ctx.db.cSRActivity.create({ data: { ...input, organizerId: ctx.user.id } });
  }),
  participate: protectedProcedure.input(z.object({ activityId: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.employeeParticipation.upsert({
      where: { employeeId_activityId: { employeeId: ctx.user.id, activityId: input.activityId } },
      create: { employeeId: ctx.user.id, activityId: input.activityId, status: "PENDING" },
      update: {},
    });
  }),
  participations: protectedProcedure.input(z.object({ activityId: z.string().optional() })).query(async ({ ctx, input }) => {
    const where = input.activityId ? { activityId: input.activityId } : {};
    return ctx.db.employeeParticipation.findMany({
      where,
      include: { employee: true, activity: { include: { department: true, category: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),
  approve: protectedProcedure.input(z.object({ id: z.string(), status: z.enum(["APPROVED", "REJECTED"]) })).mutation(async ({ ctx, input }) => {
    const activity = await ctx.db.cSRActivity.findUnique({ where: { id: input.id } });
    const updated = await ctx.db.cSRActivity.update({ where: { id: input.id }, data: { status: input.status } });

    if (activity?.organizerId) {
      if (input.status === "APPROVED") {
        await ctx.db.user.update({ where: { id: activity.organizerId }, data: { xp: { increment: 25 } } });
        await checkAndAwardBadges(activity.organizerId);
        if (activity.departmentId) {
          const now = new Date();
          await calculateDepartmentScores(activity.departmentId, now.getMonth() + 1, now.getFullYear());
        }
      }

      await ctx.db.notification.create({
        data: {
          userId: activity.organizerId,
          title: input.status === "APPROVED" ? "CSR Activity Approved" : "CSR Activity Rejected",
          message: input.status === "APPROVED"
            ? `Your CSR activity "${activity.title}" has been approved! +25 XP awarded.`
            : `Your CSR activity "${activity.title}" has been rejected.`,
          type: input.status === "APPROVED" ? "CSR_APPROVAL" : "GENERAL",
          link: "/social/csr",
        },
      });
    }

    return updated;
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
