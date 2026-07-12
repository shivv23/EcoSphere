import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const calendarRouter = router({
  events: protectedProcedure
    .input(z.object({ month: z.number(), year: z.number() }).optional())
    .query(async ({ ctx, input }) => {
      const month = input?.month ?? new Date().getMonth() + 1;
      const year = input?.year ?? new Date().getFullYear();
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);

      const events: { id: string; title: string; date: Date; type: string; color: string; description: string }[] = [];

      const audits = await ctx.db.audit.findMany({ where: { auditDate: { gte: start, lte: end } } });
      audits.forEach(a => events.push({ id: `audit-${a.id}`, title: a.title, date: a.auditDate, type: "Audit", color: "blue", description: `Score: ${a.score}` }));

      const issues = await ctx.db.complianceIssue.findMany({ where: { dueDate: { gte: start, lte: end } } });
      issues.forEach(i => events.push({ id: `issue-${i.id}`, title: i.title, date: i.dueDate, type: "Compliance", color: "red", description: `Severity: ${i.severity}` }));

      const policies = await ctx.db.eSGPolicy.findMany({ where: { reviewDate: { gte: start, lte: end } } });
      policies.forEach(p => events.push({ id: `policy-${p.id}`, title: `Review: ${p.title}`, date: p.reviewDate!, type: "Policy", color: "purple", description: p.category }));

      const activities = await ctx.db.cSRActivity.findMany({ where: { date: { gte: start, lte: end } } });
      activities.forEach(a => events.push({ id: `csr-${a.id}`, title: a.title, date: a.date, type: "CSR", color: "emerald", description: a.location || "" }));

      const challenges = await ctx.db.challenge.findMany({ where: { deadline: { gte: start, lte: end } } });
      challenges.forEach(c => events.push({ id: `challenge-${c.id}`, title: c.title, date: c.deadline, type: "Challenge", color: "amber", description: `XP: ${c.xpReward}` }));

      return events;
    }),
});
