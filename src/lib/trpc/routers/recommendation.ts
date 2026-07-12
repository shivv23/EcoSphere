import { router, protectedProcedure } from "@/lib/trpc/server";

export const recommendationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const recommendations: { id: string; title: string; description: string; impact: string; priority: string; category: string; metric?: string; currentValue?: number; targetValue?: number; icon: string }[] = [];

    const totalCarbon = await ctx.db.carbonTransaction.aggregate({ _sum: { totalEmissions: true } });
    const carbon = totalCarbon._sum.totalEmissions || 0;
    const userCount = await ctx.db.user.count();
    const carbonPerEmployee = userCount > 0 ? carbon / userCount : 0;

    if (carbonPerEmployee > 3) {
      recommendations.push({
        id: "rec-1", title: "Reduce Carbon Intensity",
        description: `Your carbon intensity is ${carbonPerEmployee.toFixed(1)} tCO2e/employee, above the industry average of 4.2. Consider switching to renewable energy sources and optimizing logistics.`,
        impact: `Potential reduction: ${Math.round(carbonPerEmployee * 0.3 * userCount)} tCO2e/year`,
        priority: "HIGH", category: "Environmental", metric: "Carbon Intensity", currentValue: Math.round(carbonPerEmployee * 10) / 10, targetValue: 3.0, icon: "leaf"
      });
    }

    const scope2 = await ctx.db.carbonTransaction.aggregate({ _sum: { totalEmissions: true }, where: { scope: 2 } });
    const scope2Val = scope2._sum.totalEmissions || 0;
    if (scope2Val > carbon * 0.3) {
      recommendations.push({
        id: "rec-2", title: "Transition to Renewable Energy",
        description: `Scope 2 emissions (${scope2Val.toFixed(0)} tCO2e) represent ${Math.round(scope2Val/carbon*100)}% of total. Solar or wind PPAs could reduce this by 40-60%.`,
        impact: `Save ${Math.round(scope2Val * 0.45)} tCO2e annually`,
        priority: "HIGH", category: "Environmental", metric: "Scope 2 Share", currentValue: Math.round(scope2Val/carbon*100), targetValue: 20, icon: "zap"
      });
    }

    const openIssues = await ctx.db.complianceIssue.count({ where: { status: "OPEN" } });
    const criticalIssues = await ctx.db.complianceIssue.count({ where: { status: "OPEN", severity: "CRITICAL" } });
    if (criticalIssues > 0) {
      recommendations.push({
        id: "rec-3", title: "Address Critical Compliance Issues",
        description: `${criticalIssues} critical compliance issue(s) require immediate attention. Delayed resolution increases regulatory risk and potential fines.`,
        impact: "Reduce regulatory risk exposure",
        priority: "CRITICAL", category: "Governance", metric: "Critical Issues", currentValue: criticalIssues, targetValue: 0, icon: "shield"
      });
    }

    if (openIssues > 3) {
      recommendations.push({
        id: "rec-4", title: "Streamline Compliance Workflow",
        description: `${openIssues} open compliance issues. Consider implementing automated tracking and assigning dedicated owners to improve resolution time.`,
        impact: `Target: resolve ${openIssues - 2} issues within 30 days`,
        priority: "MEDIUM", category: "Governance", metric: "Open Issues", currentValue: openIssues, targetValue: 2, icon: "clipboard"
      });
    }

    const csrCount = await ctx.db.cSRActivity.count();
    const participationCount = await ctx.db.employeeParticipation.count();
    const participationRate = userCount > 0 ? (participationCount / (csrCount * userCount)) * 100 : 0;
    if (participationRate < 50) {
      recommendations.push({
        id: "rec-5", title: "Boost CSR Participation",
        description: `Only ${participationRate.toFixed(0)}% employee participation in CSR activities. Gamification incentives and manager encouragement can drive engagement.`,
        impact: `Target: increase to ${Math.min(80, participationRate + 20)}% participation`,
        priority: "MEDIUM", category: "Social", metric: "CSR Participation", currentValue: Math.round(participationRate), targetValue: 60, icon: "users"
      });
    }

    const femaleCount = await ctx.db.user.count({ where: { gender: "FEMALE" } });
    const diversityRatio = userCount > 0 ? (femaleCount / userCount) * 100 : 0;
    if (diversityRatio < 40) {
      recommendations.push({
        id: "rec-6", title: "Improve Gender Diversity",
        description: `Current gender diversity is ${diversityRatio.toFixed(0)}% female. Set hiring targets and implement mentorship programs to improve representation.`,
        impact: "Target: achieve 40%+ gender diversity",
        priority: "MEDIUM", category: "Social", metric: "Gender Diversity", currentValue: Math.round(diversityRatio), targetValue: 40, icon: "heart"
      });
    }

    const totalPolicies = await ctx.db.eSGPolicy.count();
    const totalAcknowledgements = await ctx.db.policyAcknowledgement.count();
    const acknowledgmentRate = totalPolicies * userCount > 0 ? (totalAcknowledgements / (totalPolicies * userCount)) * 100 : 0;
    if (acknowledgmentRate < 80) {
      recommendations.push({
        id: "rec-7", title: "Improve Policy Acknowledgment Rate",
        description: `Only ${acknowledgmentRate.toFixed(0)}% of policy acknowledgments completed. Non-compliance risks regulatory penalties.`,
        impact: "Achieve 100% policy acknowledgment",
        priority: "HIGH", category: "Governance", metric: "Policy Acknowledgment", currentValue: Math.round(acknowledgmentRate), targetValue: 100, icon: "file-text"
      });
    }

    const activeChallenges = await ctx.db.challenge.count({ where: { status: "ACTIVE" } });
    const challengeParticipations = await ctx.db.challengeParticipation.count();
    if (activeChallenges > 0 && challengeParticipations < activeChallenges * 3) {
      recommendations.push({
        id: "rec-8", title: "Increase Challenge Engagement",
        description: `${activeChallenges} active challenges with only ${challengeParticipations} participants. Promote challenges via notifications and increase XP rewards.`,
        impact: `Target: ${activeChallenges * 5}+ participants`,
        priority: "LOW", category: "Gamification", metric: "Challenge Engagement", currentValue: challengeParticipations, targetValue: activeChallenges * 5, icon: "trophy"
      });
    }

    if (recommendations.length < 3) {
      recommendations.push({
        id: "rec-pos-1", title: "Your ESG Program is Performing Well",
        description: "Keep up the good work! Consider setting more ambitious targets and sharing your sustainability story with stakeholders.",
        impact: "Strengthen brand reputation and investor confidence",
        priority: "LOW", category: "General", icon: "star"
      });
    }

    return recommendations;
  }),
});
