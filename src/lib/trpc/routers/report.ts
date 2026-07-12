import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const reportRouter = router({
  generate: protectedProcedure
    .input(z.object({ type: z.enum(["ENVIRONMENTAL", "SOCIAL", "GOVERNANCE", "SUMMARY"]), departmentId: z.string().optional(), startDate: z.date().optional(), endDate: z.date().optional(), employeeId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const deptFilter = input.departmentId ? { departmentId: input.departmentId } : {};
      const dateFilter = input.startDate && input.endDate ? { date: { gte: input.startDate, lte: input.endDate } } : {};

      if (input.type === "ENVIRONMENTAL") {
        const carbon = await ctx.db.carbonTransaction.findMany({ where: { ...deptFilter, ...dateFilter } });
        const goals = await ctx.db.environmentalGoal.findMany();
        const totalEmissions = carbon.reduce((sum, t) => sum + t.totalEmissions, 0);
        const byScope = { scope1: carbon.filter(t => t.scope === 1).reduce((s, t) => s + t.totalEmissions, 0), scope2: carbon.filter(t => t.scope === 2).reduce((s, t) => s + t.totalEmissions, 0), scope3: carbon.filter(t => t.scope === 3).reduce((s, t) => s + t.totalEmissions, 0) };
        return { type: "ENVIRONMENTAL", totalEmissions, byScope, transactionCount: carbon.length, goals };
      }
      if (input.type === "SOCIAL") {
        const activities = await ctx.db.cSRActivity.findMany({ where: { ...deptFilter, ...dateFilter }, include: { participations: true, category: true } });
        const participations = await ctx.db.employeeParticipation.findMany({ where: { activity: deptFilter } });
        const totalParticipants = participations.length;
        const totalPoints = participations.reduce((s, p) => s + p.pointsEarned, 0);
        return { type: "SOCIAL", totalActivities: activities.length, totalParticipants, totalPoints, activities };
      }
      if (input.type === "GOVERNANCE") {
        const policies = await ctx.db.eSGPolicy.findMany({ include: { _count: { select: { acknowledgements: true } } } });
        const audits = await ctx.db.audit.findMany();
        const issues = await ctx.db.complianceIssue.findMany({ where: deptFilter });
        return { type: "GOVERNANCE", totalPolicies: policies.length, totalAudits: audits.length, openIssues: issues.filter(i => i.status === "OPEN").length, policies, audits, issues };
      }
      // SUMMARY
      const [carbon, csr, issues, policies, audits] = await Promise.all([
        ctx.db.carbonTransaction.aggregate({ where: deptFilter, _sum: { totalEmissions: true } }),
        ctx.db.cSRActivity.findMany({ where: deptFilter, include: { participations: true } }),
        ctx.db.complianceIssue.findMany({ where: deptFilter }),
        ctx.db.eSGPolicy.count(),
        ctx.db.audit.count(),
      ]);
      return {
        type: "SUMMARY",
        totalEmissions: carbon._sum.totalEmissions || 0,
        totalCSR: csr.length,
        totalParticipation: csr.reduce((s, a) => s + a.participations.length, 0),
        openIssues: issues.filter(i => i.status === "OPEN").length,
        totalPolicies: policies,
        totalAudits: audits,
      };
    }),
});
