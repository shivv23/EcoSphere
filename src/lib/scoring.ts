import { db } from "@/lib/db";

export async function calculateDepartmentScores(departmentId: string, month: number, year: number) {
  const org = await db.organizationProfile.findFirst();
  const envW = org?.envWeight || 0.4;
  const socialW = org?.socialWeight || 0.3;
  const govW = org?.govWeight || 0.3;

  // Environmental Score (based on emissions - lower is better)
  const carbon = await db.carbonTransaction.aggregate({
    where: {
      departmentId,
      date: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) },
    },
    _sum: { totalEmissions: true },
  });
  const totalEmissions = carbon._sum.totalEmissions || 0;
  const envScore = Math.max(0, 100 - (totalEmissions / 100));

  // Social Score (based on CSR participation)
  const participations = await db.employeeParticipation.count({
    where: {
      activity: { departmentId },
      status: "APPROVED",
    },
  });
  const employees = await db.user.count({ where: { departmentId } });
  const socialScore = employees > 0 ? Math.min(100, (participations / employees) * 100) : 50;

  // Governance Score (based on audit scores + compliance)
  const audits = await db.audit.findMany({
    where: { auditDate: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) } },
    select: { score: true },
  });
  const avgAuditScore = audits.length > 0
    ? audits.reduce((sum, a) => sum + (a.score || 50), 0) / audits.length
    : 70;

  const openIssues = await db.complianceIssue.count({
    where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
  });
  const govScore = Math.max(0, avgAuditScore - openIssues * 5);

  const totalScore = Math.round((envScore * envW + socialScore * socialW + govScore * govW) * 10) / 10;

  return db.departmentScore.upsert({
    where: { departmentId_month_year: { departmentId, month, year } },
    create: {
      departmentId,
      month,
      year,
      environmentalScore: Math.round(envScore * 10) / 10,
      socialScore: Math.round(socialScore * 10) / 10,
      governanceScore: Math.round(govScore * 10) / 10,
      totalScore,
    },
    update: {
      environmentalScore: Math.round(envScore * 10) / 10,
      socialScore: Math.round(socialScore * 10) / 10,
      governanceScore: Math.round(govScore * 10) / 10,
      totalScore,
    },
  });
}

export async function checkAndAwardBadges(employeeId: string) {
  const user = await db.user.findUnique({
    where: { id: employeeId },
    include: {
      challengeParticipations: { where: { status: "APPROVED" } },
      badgeAssignments: { include: { badge: true } },
    },
  });
  if (!user) return;

  const badges = await db.badge.findMany({ where: { status: true } });
  const earnedBadgeIds = new Set(user.badgeAssignments.map((a) => a.badgeId));
  const completedChallenges = user.challengeParticipations.length;

  for (const badge of badges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    const meetsXP = user.xp >= badge.xpThreshold;
    const meetsChallenges = completedChallenges >= badge.challengeThreshold;

    if (meetsXP && meetsChallenges) {
      await db.badgeAssignment.create({
        data: { employeeId, badgeId: badge.id },
      });

      await db.notification.create({
        data: {
          userId: employeeId,
          title: `Badge Unlocked: ${badge.name}!`,
          message: `Congratulations! You earned the ${badge.icon} ${badge.name} badge.`,
          type: "BADGE_UNLOCK",
          link: "/gamification/badges",
        },
      });
    }
  }
}
