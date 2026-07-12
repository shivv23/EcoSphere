import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const thresholdRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.thresholdConfig.findMany({ orderBy: { createdAt: "desc" } });
  }),
  create: protectedProcedure
    .input(z.object({ name: z.string(), metric: z.string(), threshold: z.number(), unit: z.string(), severity: z.string().default("MEDIUM") }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.thresholdConfig.create({ data: input });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.string(), enabled: z.boolean().optional(), threshold: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.thresholdConfig.update({ where: { id }, data });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.thresholdConfig.delete({ where: { id: input.id } });
    }),
  check: protectedProcedure.query(async ({ ctx }) => {
    const thresholds = await ctx.db.thresholdConfig.findMany({ where: { enabled: true } });
    const alerts: { name: string; value: number; threshold: number; unit: string; severity: string }[] = [];

    for (const t of thresholds) {
      let value = 0;
      if (t.metric === "totalCarbonEmissions") {
        const result = await ctx.db.carbonTransaction.aggregate({ _sum: { totalEmissions: true } });
        value = result._sum.totalEmissions || 0;
      } else if (t.metric === "openComplianceIssues") {
        value = await ctx.db.complianceIssue.count({ where: { status: "OPEN" } });
      } else if (t.metric === "totalCSRActivities") {
        value = await ctx.db.cSRActivity.count();
      } else if (t.metric === "activeEmployees") {
        value = await ctx.db.user.count();
      }
      if (value > t.threshold) {
        alerts.push({ name: t.name, value, threshold: t.threshold, unit: t.unit, severity: t.severity });
      }
    }
    return alerts;
  }),
});
