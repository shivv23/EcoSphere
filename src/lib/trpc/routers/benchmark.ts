import { router, protectedProcedure } from "@/lib/trpc/server";

const DEFAULT_BENCHMARKS = [
  { industry: "Technology", metric: "Carbon Intensity (tCO2e/employee)", avgValue: 4.2, topValue: 1.8, year: 2026 },
  { industry: "Technology", metric: "Renewable Energy %", avgValue: 45, topValue: 90, year: 2026 },
  { industry: "Technology", metric: "Waste Diversion %", avgValue: 62, topValue: 95, year: 2026 },
  { industry: "Technology", metric: "Employee Satisfaction", avgValue: 72, topValue: 92, year: 2026 },
  { industry: "Technology", metric: "Training Hours/Employee", avgValue: 24, topValue: 60, year: 2026 },
  { industry: "Technology", metric: "Gender Diversity %", avgValue: 38, topValue: 55, year: 2026 },
  { industry: "Technology", metric: "Policy Compliance %", avgValue: 78, topValue: 98, year: 2026 },
  { industry: "Technology", metric: "Audit Score", avgValue: 72, topValue: 95, year: 2026 },
];

async function ensureBenchmarks(db: any) {
  const count = await db.industryBenchmark.count();
  if (count === 0) {
    for (const b of DEFAULT_BENCHMARKS) {
      await db.industryBenchmark.upsert({
        where: { industry_metric_year: { industry: b.industry, metric: b.metric, year: b.year } },
        update: { avgValue: b.avgValue, topValue: b.topValue },
        create: b,
      });
    }
  }
}

export const benchmarkRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    await ensureBenchmarks(ctx.db);
    return ctx.db.industryBenchmark.findMany({ orderBy: { metric: "asc" } });
  }),
  companyMetrics: protectedProcedure.query(async ({ ctx }) => {
    const totalUsers = await ctx.db.user.count();
    const totalCarbon = await ctx.db.carbonTransaction.aggregate({ _sum: { totalEmissions: true } });
    const avgAudit = await ctx.db.audit.aggregate({ _avg: { score: true } });
    const openIssues = await ctx.db.complianceIssue.count({ where: { status: "OPEN" } });
    const policies = await ctx.db.eSGPolicy.count();
    const totalCSR = await ctx.db.cSRActivity.count();
    const femaleCount = await ctx.db.user.count({ where: { gender: "FEMALE" } });
    const challenges = await ctx.db.challenge.count({ where: { status: "ACTIVE" } });
    const participations = await ctx.db.challengeParticipation.count();

    const carbonIntensity = totalUsers > 0
      ? Math.round(((totalCarbon._sum.totalEmissions || 0) / totalUsers) * 10) / 10
      : 0;
    const genderDiversity = totalUsers > 0
      ? Math.round((femaleCount / totalUsers) * 100)
      : 0;
    const policyCompliance = policies > 0
      ? Math.round(((policies - openIssues) / policies) * 100)
      : 0;
    const auditScore = Math.round(avgAudit._avg.score || 0);

    const totalParticipations = await ctx.db.employeeParticipation.count({
      where: { status: "APPROVED" },
    });
    const activeChallenges = await ctx.db.challengeParticipation.count({
      where: { status: "APPROVED" },
    });
    const resolvedIssues = await ctx.db.complianceIssue.count({
      where: { status: "RESOLVED" },
    });
    const deptScores = await ctx.db.departmentScore.findMany({
      select: { totalScore: true },
    });
    const avgDeptScore = deptScores.length > 0
      ? deptScores.reduce((s: number, d: any) => s + d.totalScore, 0) / deptScores.length
      : 0;

    const trainingHours = totalParticipations > 0
      ? Math.min(80, Math.round(totalParticipations * 2))
      : 0;
    const renewableEnergy = policies > 0
      ? Math.min(100, Math.round((policies / Math.max(policies + openIssues, 1)) * 100))
      : 0;
    const wasteDiversion = resolvedIssues > 0 || openIssues > 0
      ? Math.min(100, Math.round((resolvedIssues / Math.max(resolvedIssues + openIssues, 1)) * 100))
      : 0;
    const employeeSatisfaction = avgDeptScore > 0
      ? Math.min(100, Math.round(avgDeptScore))
      : 0;

    return {
      carbonIntensity,
      renewableEnergy,
      wasteDiversion,
      employeeSatisfaction,
      trainingHours,
      genderDiversity,
      policyCompliance,
      auditScore,
    };
  }),
});
