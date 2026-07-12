import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const complianceRouter = router({
  list: protectedProcedure.input(z.object({ status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(), severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional() }).optional()).query(async ({ ctx, input }) => {
    const where: any = {};
    if (input?.status) where.status = input.status;
    if (input?.severity) where.severity = input.severity;
    return ctx.db.complianceIssue.findMany({ where, include: { owner: true, audit: true }, orderBy: { createdAt: "desc" } });
  }),
  create: protectedProcedure.input(z.object({ title: z.string().min(1), description: z.string().min(1), severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"), ownerId: z.string(), auditId: z.string().optional(), dueDate: z.date() })).mutation(async ({ ctx, input }) => {
    return ctx.db.complianceIssue.create({ data: input });
  }),
  update: protectedProcedure.input(z.object({ id: z.string() }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    return ctx.db.complianceIssue.update({ where: { id }, data });
  }),
  resolve: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.complianceIssue.update({ where: { id: input.id }, data: { status: "RESOLVED", resolvedAt: new Date() } });
  }),
  stats: protectedProcedure.query(async ({ ctx }) => {
    const open = await ctx.db.complianceIssue.count({ where: { status: "OPEN" } });
    const inProgress = await ctx.db.complianceIssue.count({ where: { status: "IN_PROGRESS" } });
    const resolved = await ctx.db.complianceIssue.count({ where: { status: "RESOLVED" } });
    const critical = await ctx.db.complianceIssue.count({ where: { severity: "CRITICAL", status: { notIn: ["RESOLVED", "CLOSED"] } } });
    return { open, inProgress, resolved, critical };
  }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.complianceIssue.delete({ where: { id: input.id } });
  }),
});
