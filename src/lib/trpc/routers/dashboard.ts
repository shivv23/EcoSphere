import { router, protectedProcedure } from "@/lib/trpc/server";

export const dashboardRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const [totalUsers, totalDepartments, totalCSR, totalChallenges, totalCarbon, openIssues, totalBadges, totalPolicies] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.department.count(),
      ctx.db.cSRActivity.count(),
      ctx.db.challenge.count(),
      ctx.db.carbonTransaction.aggregate({ _sum: { totalEmissions: true } }),
      ctx.db.complianceIssue.count({ where: { status: "OPEN" } }),
      ctx.db.badge.count(),
      ctx.db.eSGPolicy.count(),
    ]);
    const recentActivities = await ctx.db.cSRActivity.findMany({ take: 5, include: { category: true, department: true }, orderBy: { date: "desc" } });
    const topEmployees = await ctx.db.user.findMany({ take: 5, orderBy: { xp: "desc" }, select: { name: true, xp: true, department: { select: { name: true } } } });
    const recentCompliance = await ctx.db.complianceIssue.findMany({ take: 5, include: { owner: true }, orderBy: { createdAt: "desc" } });
    return { totalUsers, totalDepartments, totalCSR, totalChallenges, totalCarbonEmissions: totalCarbon._sum.totalEmissions || 0, openIssues, totalBadges, totalPolicies, recentActivities, topEmployees, recentCompliance };
  }),
  carbonTrend: protectedProcedure.query(async ({ ctx }) => {
    const transactions = await ctx.db.carbonTransaction.findMany({ orderBy: { date: "asc" } });
    const monthly: Record<string, { scope1: number; scope2: number; scope3: number }> = {};
    transactions.forEach((t) => {
      const key = t.date.toISOString().slice(0, 7);
      if (!monthly[key]) monthly[key] = { scope1: 0, scope2: 0, scope3: 0 };
      if (t.scope === 1) monthly[key].scope1 += t.totalEmissions;
      else if (t.scope === 2) monthly[key].scope2 += t.totalEmissions;
      else monthly[key].scope3 += t.totalEmissions;
    });
    return Object.entries(monthly).map(([month, data]) => ({ month, ...data, total: data.scope1 + data.scope2 + data.scope3 }));
  }),
  departmentScores: protectedProcedure.query(async ({ ctx }) => {
    const departments = await ctx.db.department.findMany({ include: { departmentScores: { orderBy: { calculatedAt: "desc" }, take: 1 } } });
    return departments.map((d) => ({ name: d.name, code: d.code, score: d.departmentScores[0]?.totalScore || 0, env: d.departmentScores[0]?.environmentalScore || 0, social: d.departmentScores[0]?.socialScore || 0, gov: d.departmentScores[0]?.governanceScore || 0 }));
  }),
  trends: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [thisMonthCarbon, lastMonthCarbon, thisMonthCSR, lastMonthCSR, thisMonthIssues, lastMonthIssues] = await Promise.all([
      ctx.db.carbonTransaction.aggregate({ _sum: { totalEmissions: true }, where: { date: { gte: thisMonth } } }),
      ctx.db.carbonTransaction.aggregate({ _sum: { totalEmissions: true }, where: { date: { gte: lastMonth, lt: thisMonth } } }),
      ctx.db.cSRActivity.count({ where: { date: { gte: thisMonth } } }),
      ctx.db.cSRActivity.count({ where: { date: { gte: lastMonth, lt: thisMonth } } }),
      ctx.db.complianceIssue.count({ where: { status: "OPEN", createdAt: { gte: thisMonth } } }),
      ctx.db.complianceIssue.count({ where: { status: "OPEN", createdAt: { gte: lastMonth, lt: thisMonth } } }),
    ]);

    const thisTotal = thisMonthCarbon._sum.totalEmissions || 0;
    const lastTotal = lastMonthCarbon._sum.totalEmissions || 0;
    const carbonTrend = lastTotal > 0 ? Math.round(((thisTotal - lastTotal) / lastTotal) * 100) : 0;
    const csrTrend = lastMonthCSR > 0 ? Math.round(((thisMonthCSR - lastMonthCSR) / lastMonthCSR) * 100) : 0;
    const issueTrend = lastMonthIssues > 0 ? Math.round(((thisMonthIssues - lastMonthIssues) / lastMonthIssues) * 100) : 0;

    return { carbonTrend, csrTrend, issueTrend };
  }),
  myStats: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    const myActivities = await ctx.db.employeeParticipation.count({ where: { employeeId: user.id } });
    const myChallenges = await ctx.db.challengeParticipation.count({ where: { employeeId: user.id } });
    const myBadges = await ctx.db.badgeAssignment.count({ where: { employeeId: user.id } });
    const myNotifications = await ctx.db.notification.count({ where: { userId: user.id, read: false } });
    const fullUser = await ctx.db.user.findUnique({ where: { id: user.id }, select: { xp: true, name: true, department: { select: { name: true } } } });
    const recentNotifications = await ctx.db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 });
    return { myActivities, myChallenges, myBadges, myNotifications, xp: fullUser?.xp || 0, departmentName: fullUser?.department?.name || "Unassigned", recentNotifications };
  }),
});
