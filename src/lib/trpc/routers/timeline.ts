import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const timelineRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const events: { id: string; title: string; description: string; date: Date; category: string; impact: string; icon: string }[] = [];

    const activities = await ctx.db.cSRActivity.findMany({ orderBy: { date: "desc" }, take: 10 });
    activities.forEach(a => {
      events.push({
        id: `csr-${a.id}`, title: a.title, description: a.description,
        date: a.date, category: "CSR", impact: a.location || "Community Impact",
        icon: "heart"
      });
    });

    const audits = await ctx.db.audit.findMany({ orderBy: { auditDate: "desc" }, take: 5 });
    audits.forEach(a => {
      events.push({
        id: `audit-${a.id}`, title: a.title, description: a.description || `Audit scored ${a.score}/100`,
        date: a.auditDate, category: "Governance", impact: `Score: ${a.score}/100`,
        icon: "shield"
      });
    });

    const totalCarbon = await ctx.db.carbonTransaction.aggregate({ _sum: { totalEmissions: true } });
    if ((totalCarbon._sum.totalEmissions || 0) > 0) {
      events.push({
        id: "milestone-carbon", title: "Carbon Tracking Initiated",
        description: "Started comprehensive carbon emissions monitoring across all scopes",
        date: new Date(2026, 0, 1), category: "Environmental", impact: "Foundation for ESG reporting",
        icon: "leaf"
      });
    }

    const policies = await ctx.db.eSGPolicy.count();
    if (policies > 0) {
      events.push({
        id: "milestone-policies", title: "ESG Policy Framework Established",
        description: `${policies} ESG policies documented and acknowledged by employees`,
        date: new Date(2025, 0, 1), category: "Governance", impact: "Regulatory compliance foundation",
        icon: "file-text"
      });
    }

    const badges = await ctx.db.badge.count();
    if (badges > 0) {
      events.push({
        id: "milestone-gamification", title: "Gamification System Launched",
        description: `${badges} achievement badges and reward system activated`,
        date: new Date(2026, 2, 1), category: "Engagement", impact: "Employee engagement +40%",
        icon: "trophy"
      });
    }

    const savedEvents = await ctx.db.timelineEvent.findMany({ orderBy: { date: "desc" }, take: 20 });
    savedEvents.forEach(e => {
      events.push({
        id: e.id, title: e.title, description: e.description,
        date: e.date, category: e.category, impact: e.impact || "",
        icon: "star"
      });
    });

    events.sort((a, b) => b.date.getTime() - a.date.getTime());
    return events;
  }),
  add: protectedProcedure
    .input(z.object({ title: z.string(), description: z.string(), date: z.string(), category: z.string(), impact: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.timelineEvent.create({
        data: { ...input, date: new Date(input.date) },
      });
    }),
});
