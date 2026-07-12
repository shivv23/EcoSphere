import { router, protectedProcedure } from "@/lib/trpc/server";

const BENCHMARK_DATA = [
  { industry: "Technology", metric: "Carbon Intensity (tCO2e/employee)", avgValue: 4.2, topValue: 1.8, year: 2026 },
  { industry: "Technology", metric: "Renewable Energy %", avgValue: 45, topValue: 90, year: 2026 },
  { industry: "Technology", metric: "Waste Diversion %", avgValue: 62, topValue: 95, year: 2026 },
  { industry: "Technology", metric: "Employee Satisfaction", avgValue: 72, topValue: 92, year: 2026 },
  { industry: "Technology", metric: "Training Hours/Employee", avgValue: 24, topValue: 60, year: 2026 },
  { industry: "Technology", metric: "Gender Diversity %", avgValue: 38, topValue: 55, year: 2026 },
  { industry: "Technology", metric: "Policy Compliance %", avgValue: 78, topValue: 98, year: 2026 },
  { industry: "Technology", metric: "Audit Score", avgValue: 72, topValue: 95, year: 2026 },
];

export const benchmarkRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return BENCHMARK_DATA;
  }),
  companyMetrics: protectedProcedure.query(async ({ ctx }) => {
    const totalUsers = await ctx.db.user.count();
    const totalCarbon = await ctx.db.carbonTransaction.aggregate({ _sum: { totalEmissions: true } });
    const totalCSR = await ctx.db.cSRActivity.count();
    const avgAudit = await ctx.db.audit.aggregate({ _avg: { score: true } });
    const openIssues = await ctx.db.complianceIssue.count({ where: { status: "OPEN" } });
    const policies = await ctx.db.eSGPolicy.count();

    return {
      carbonIntensity: totalUsers > 0 ? Math.round(((totalCarbon._sum.totalEmissions || 0) / totalUsers) * 10) / 10 : 0,
      renewableEnergy: 52,
      wasteDiversion: 68,
      employeeSatisfaction: 81,
      trainingHours: 32,
      genderDiversity: totalUsers > 0 ? Math.round((await ctx.db.user.count({ where: { gender: "FEMALE" } }) / totalUsers) * 100) : 0,
      policyCompliance: policies > 0 ? Math.round(((policies - openIssues) / policies) * 100) : 0,
      auditScore: Math.round(avgAudit._avg.score || 0),
    };
  }),
});
