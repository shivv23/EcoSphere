import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding EcoSphere database...");

  // Clear existing data (reverse dependency order for MySQL)
  await prisma.rewardRedemption.deleteMany();
  await prisma.badgeAssignment.deleteMany();
  await prisma.policyAcknowledgement.deleteMany();
  await prisma.challengeParticipation.deleteMany();
  await prisma.employeeParticipation.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.complianceIssue.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.departmentScore.deleteMany();
  await prisma.carbonTransaction.deleteMany();
  await prisma.cSRActivity.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.eSGPolicy.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.emissionFactor.deleteMany();
  await prisma.category.deleteMany();
  await prisma.organizationProfile.deleteMany();
  await prisma.systemSettings.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("admin123", 12);
  const userPass = await bcrypt.hash("user123", 12);

  // Departments
  const departments = await Promise.all([
    prisma.department.create({ data: { name: "Engineering", code: "ENG", employeeCount: 25 } }),
    prisma.department.create({ data: { name: "Marketing", code: "MKT", employeeCount: 15 } }),
    prisma.department.create({ data: { name: "Operations", code: "OPS", employeeCount: 20 } }),
    prisma.department.create({ data: { name: "Human Resources", code: "HR", employeeCount: 8 } }),
    prisma.department.create({ data: { name: "Finance", code: "FIN", employeeCount: 12 } }),
  ]);

  // Users
  const users = await Promise.all([
    prisma.user.create({ data: { name: "Admin User", email: "admin@ecosphere.com", password, role: "ADMIN", departmentId: departments[0].id, xp: 2500, gender: "MALE" } }),
    prisma.user.create({ data: { name: "Priya Sharma", email: "priya@ecosphere.com", password: userPass, role: "MANAGER", departmentId: departments[1].id, xp: 1800, gender: "FEMALE" } }),
    prisma.user.create({ data: { name: "Rahul Verma", email: "rahul@ecosphere.com", password: userPass, role: "EMPLOYEE", departmentId: departments[0].id, xp: 1200, gender: "MALE" } }),
    prisma.user.create({ data: { name: "Sarah Chen", email: "sarah@ecosphere.com", password: userPass, role: "EMPLOYEE", departmentId: departments[2].id, xp: 950, gender: "FEMALE" } }),
    prisma.user.create({ data: { name: "Marcus Johnson", email: "marcus@ecosphere.com", password: userPass, role: "EMPLOYEE", departmentId: departments[3].id, xp: 750, gender: "MALE" } }),
    prisma.user.create({ data: { name: "Aisha Patel", email: "aisha@ecosphere.com", password: userPass, role: "EMPLOYEE", departmentId: departments[4].id, xp: 600, gender: "FEMALE" } }),
    prisma.user.create({ data: { name: "David Kim", email: "david@ecosphere.com", password: userPass, role: "EMPLOYEE", departmentId: departments[0].id, xp: 450, gender: "MALE" } }),
    prisma.user.create({ data: { name: "Elena Rodriguez", email: "elena@ecosphere.com", password: userPass, role: "EMPLOYEE", departmentId: departments[1].id, xp: 300, gender: "FEMALE", ethnicity: "Hispanic" } }),
    prisma.user.create({ data: { name: "James Wright", email: "james@ecosphere.com", password: userPass, role: "EMPLOYEE", departmentId: departments[2].id, xp: 200, gender: "MALE" } }),
    prisma.user.create({ data: { name: "Mei Lin", email: "mei@ecosphere.com", password: userPass, role: "EMPLOYEE", departmentId: departments[4].id, xp: 150, gender: "FEMALE", ethnicity: "Asian" } }),
    prisma.user.create({ data: { name: "Omar Hassan", email: "omar@ecosphere.com", password: userPass, role: "EMPLOYEE", departmentId: departments[0].id, xp: 100, gender: "MALE" } }),
    prisma.user.create({ data: { name: "Lisa Thompson", email: "lisa@ecosphere.com", password: userPass, role: "EMPLOYEE", departmentId: departments[3].id, xp: 50, gender: "FEMALE" } }),
  ]);

  // Update department heads
  await prisma.department.update({ where: { id: departments[0].id }, data: { headId: users[0].id } });
  await prisma.department.update({ where: { id: departments[1].id }, data: { headId: users[1].id } });

  // Categories
  const csrCategories = await Promise.all([
    prisma.category.create({ data: { name: "Tree Plantation", type: "CSR_ACTIVITY" } }),
    prisma.category.create({ data: { name: "Community Cleanup", type: "CSR_ACTIVITY" } }),
    prisma.category.create({ data: { name: "Education Support", type: "CSR_ACTIVITY" } }),
    prisma.category.create({ data: { name: "Disaster Relief", type: "CSR_ACTIVITY" } }),
    prisma.category.create({ data: { name: "Health Camp", type: "CSR_ACTIVITY" } }),
  ]);

  const challengeCategories = await Promise.all([
    prisma.category.create({ data: { name: "Zero Waste", type: "CHALLENGE" } }),
    prisma.category.create({ data: { name: "Energy Saving", type: "CHALLENGE" } }),
    prisma.category.create({ data: { name: "Green Commute", type: "CHALLENGE" } }),
    prisma.category.create({ data: { name: "Sustainable Diet", type: "CHALLENGE" } }),
  ]);

  // Emission Factors
  const emissionFactors = await Promise.all([
    prisma.emissionFactor.create({ data: { name: "Electricity (Grid)", source: "EPA", factor: 0.417, unit: "kgCO2/kWh", scope: 2 } }),
    prisma.emissionFactor.create({ data: { name: "Natural Gas", source: "EPA", factor: 5.3, unit: "kgCO2/therm", scope: 1 } }),
    prisma.emissionFactor.create({ data: { name: "Diesel", source: "EPA", factor: 10.18, unit: "kgCO2/gallon", scope: 1 } }),
    prisma.emissionFactor.create({ data: { name: "Gasoline", source: "EPA", factor: 8.89, unit: "kgCO2/gallon", scope: 1 } }),
    prisma.emissionFactor.create({ data: { name: "Air Travel", source: "DEFRA", factor: 0.255, unit: "kgCO2/km", scope: 3 } }),
  ]);

  // Carbon Transactions (monthly data for 6 months)
  const sources = [
    { source: "Office Electricity", factor: emissionFactors[0], dept: departments[0] },
    { source: "Heating Gas", factor: emissionFactors[1], dept: departments[2] },
    { source: "Fleet Diesel", factor: emissionFactors[2], dept: departments[2] },
    { source: "Business Travel", factor: emissionFactors[4], dept: departments[1] },
  ];

  for (let month = 0; month < 6; month++) {
    const date = new Date(2026, month, 15);
    for (const s of sources) {
      const qty = 500 + Math.random() * 2000;
      await prisma.carbonTransaction.create({
        data: {
          date,
          source: s.source,
          quantity: Math.round(qty),
          totalEmissions: Math.round(qty * s.factor.factor * 100) / 100,
          scope: s.factor.scope,
          departmentId: s.dept.id,
          emissionFactorId: s.factor.id,
        },
      });
    }
  }

  // CSR Activities
  const csrActivities = await Promise.all([
    prisma.cSRActivity.create({ data: { title: "Mangrove Plantation Drive", description: "Planted 500 mangroves along the coastline to restore local ecosystem", departmentId: departments[0].id, categoryId: csrCategories[0].id, organizerId: users[0].id, location: "Marina Beach, Chennai", status: "APPROVED", date: new Date(2026, 0, 15) } }),
    prisma.cSRActivity.create({ data: { title: "Community Beach Cleanup", description: "Collected 200kg of plastic waste from the beach", departmentId: departments[1].id, categoryId: csrCategories[1].id, organizerId: users[1].id, location: "Juhu Beach, Mumbai", status: "APPROVED", date: new Date(2026, 1, 10) } }),
    prisma.cSRActivity.create({ data: { title: "STEM Workshop for Schools", description: "Conducted coding workshops for 100 underprivileged students", departmentId: departments[0].id, categoryId: csrCategories[2].id, organizerId: users[2].id, location: "Government School, Delhi", status: "APPROVED", date: new Date(2026, 2, 5) } }),
    prisma.cSRActivity.create({ data: { title: "Blood Donation Camp", description: "Organized blood donation camp with 80+ units collected", departmentId: departments[3].id, categoryId: csrCategories[4].id, organizerId: users[4].id, location: "Office Campus", status: "APPROVED", date: new Date(2026, 2, 20) } }),
    prisma.cSRActivity.create({ data: { title: "Flood Relief Supplies", description: "Distributed relief materials to flood-affected families", departmentId: departments[2].id, categoryId: csrCategories[3].id, organizerId: users[3].id, location: "Kerala", status: "PENDING", date: new Date(2026, 3, 1) } }),
    prisma.cSRActivity.create({ data: { title: "Vertical Garden Initiative", description: "Installed vertical gardens on office building to improve air quality", departmentId: departments[0].id, categoryId: csrCategories[0].id, organizerId: users[6].id, location: "Office Campus", status: "PENDING", date: new Date(2026, 4, 10) } }),
  ]);

  // Employee Participations
  const participations = [
    { employeeId: users[2].id, activityId: csrActivities[0].id, pointsEarned: 150 },
    { employeeId: users[3].id, activityId: csrActivities[0].id, pointsEarned: 150 },
    { employeeId: users[1].id, activityId: csrActivities[1].id, pointsEarned: 120 },
    { employeeId: users[4].id, activityId: csrActivities[1].id, pointsEarned: 120 },
    { employeeId: users[6].id, activityId: csrActivities[2].id, pointsEarned: 200 },
    { employeeId: users[7].id, activityId: csrActivities[2].id, pointsEarned: 200 },
    { employeeId: users[5].id, activityId: csrActivities[3].id, pointsEarned: 100 },
    { employeeId: users[11].id, activityId: csrActivities[3].id, pointsEarned: 100 },
    { employeeId: users[8].id, activityId: csrActivities[4].id, pointsEarned: 180 },
    { employeeId: users[9].id, activityId: csrActivities[0].id, pointsEarned: 150 },
  ];
  for (const p of participations) {
    await prisma.employeeParticipation.create({
      data: { ...p, status: "APPROVED", completionDate: new Date() },
    });
  }

  // Challenges
  const challenges = await Promise.all([
    prisma.challenge.create({ data: { title: "Zero Waste Week", description: "Produce zero landfill waste for an entire work week", categoryId: challengeCategories[0].id, xpReward: 300, difficulty: "Hard", deadline: new Date(2026, 5, 30), status: "ACTIVE", evidenceRequired: true } }),
    prisma.challenge.create({ data: { title: "30-Day Energy Saver", description: "Reduce personal energy consumption by 20% for 30 days", categoryId: challengeCategories[1].id, xpReward: 200, difficulty: "Medium", deadline: new Date(2026, 6, 15), status: "ACTIVE" } }),
    prisma.challenge.create({ data: { title: "Bike to Work Month", description: "Cycle or use public transport for all commutes in June", categoryId: challengeCategories[2].id, xpReward: 150, difficulty: "Easy", deadline: new Date(2026, 6, 30), status: "ACTIVE" } }),
    prisma.challenge.create({ data: { title: "Plastic Free Challenge", description: "Avoid single-use plastics for 2 weeks", categoryId: challengeCategories[0].id, xpReward: 250, difficulty: "Medium", deadline: new Date(2026, 4, 15), status: "COMPLETED" } }),
    prisma.challenge.create({ data: { title: "Green Innovation Sprint", description: "Propose and implement an eco-friendly process improvement", categoryId: challengeCategories[1].id, xpReward: 500, difficulty: "Hard", deadline: new Date(2026, 7, 1), status: "DRAFT" } }),
  ]);

  // Challenge Participations
  await prisma.challengeParticipation.create({ data: { employeeId: users[2].id, challengeId: challenges[0].id, progress: 60, status: "PENDING" } });
  await prisma.challengeParticipation.create({ data: { employeeId: users[3].id, challengeId: challenges[1].id, progress: 80, status: "APPROVED", xpAwarded: 200, completedAt: new Date() } });
  await prisma.challengeParticipation.create({ data: { employeeId: users[1].id, challengeId: challenges[2].id, progress: 45, status: "PENDING" } });
  await prisma.challengeParticipation.create({ data: { employeeId: users[6].id, challengeId: challenges[0].id, progress: 100, status: "APPROVED", xpAwarded: 300, completedAt: new Date() } });
  await prisma.challengeParticipation.create({ data: { employeeId: users[4].id, challengeId: challenges[3].id, progress: 100, status: "APPROVED", xpAwarded: 250, completedAt: new Date() } });

  // ESG Policies
  const policies = await Promise.all([
    prisma.eSGPolicy.create({ data: { title: "Environmental Sustainability Policy", description: "Our commitment to minimizing environmental impact through responsible operations, renewable energy adoption, and waste reduction across all business activities.", category: "Environmental", effectiveDate: new Date(2025, 0, 1) } }),
    prisma.eSGPolicy.create({ data: { title: "Code of Ethics & Conduct", description: "Standards of ethical behavior expected from all employees including anti-corruption, fair trade, and responsible business practices.", category: "Governance", effectiveDate: new Date(2025, 0, 1) } }),
    prisma.eSGPolicy.create({ data: { title: "Diversity & Inclusion Policy", description: "Commitment to fostering an inclusive workplace that celebrates diversity in gender, ethnicity, religion, and background.", category: "Social", effectiveDate: new Date(2025, 3, 1) } }),
    prisma.eSGPolicy.create({ data: { title: "Data Privacy & Protection", description: "Compliance with GDPR, CCPA, and other data protection regulations ensuring customer and employee data security.", category: "Governance", effectiveDate: new Date(2025, 6, 1) } }),
    prisma.eSGPolicy.create({ data: { title: "Health & Safety Policy", description: "Ensuring a safe and healthy work environment through regular audits, training, and emergency preparedness.", category: "Social", effectiveDate: new Date(2025, 0, 1) } }),
  ]);

  // Policy Acknowledgements
  for (const policy of policies) {
    for (const user of users.slice(0, 8)) {
      await prisma.policyAcknowledgement.create({
        data: { employeeId: user.id, policyId: policy.id },
      });
    }
  }

  // Audits
  const audits = await Promise.all([
    prisma.audit.create({ data: { title: "Q1 Environmental Compliance Audit", description: "Quarterly review of environmental compliance metrics", auditDate: new Date(2026, 2, 31), score: 85 } }),
    prisma.audit.create({ data: { title: "Annual Data Privacy Audit", description: "Comprehensive review of data handling and privacy practices", auditDate: new Date(2026, 0, 15), score: 92 } }),
    prisma.audit.create({ data: { title: "Workplace Safety Audit", description: "Safety compliance check across all office locations", auditDate: new Date(2026, 3, 10), score: 78 } }),
    prisma.audit.create({ data: { title: "Supply Chain ESG Audit", description: "Review of supplier ESG compliance and human rights practices", auditDate: new Date(2026, 4, 20), score: 65 } }),
  ]);

  // Compliance Issues
  await Promise.all([
    prisma.complianceIssue.create({ data: { title: "Incomplete waste disposal records", description: "Monthly waste disposal records missing for February", severity: "MEDIUM", status: "RESOLVED", ownerId: users[0].id, auditId: audits[0].id, dueDate: new Date(2026, 3, 15), resolvedAt: new Date(2026, 3, 10) } }),
    prisma.complianceIssue.create({ data: { title: "Expired fire safety certificates", description: "Fire safety certificates for 2 office floors have expired", severity: "HIGH", status: "IN_PROGRESS", ownerId: users[4].id, auditId: audits[2].id, dueDate: new Date(2026, 5, 1) } }),
    prisma.complianceIssue.create({ data: { title: "Supplier labor practice concern", description: "Anonymous report of excessive overtime at supplier facility", severity: "CRITICAL", status: "OPEN", ownerId: users[0].id, auditId: audits[3].id, dueDate: new Date(2026, 5, 15) } }),
    prisma.complianceIssue.create({ data: { title: "Missing ESG training records", description: "3 departments haven't completed mandatory ESG training", severity: "LOW", status: "OPEN", ownerId: users[4].id, dueDate: new Date(2026, 6, 1) } }),
    prisma.complianceIssue.create({ data: { title: "Energy consumption above target", description: "Office energy usage exceeded Q1 target by 15%", severity: "MEDIUM", status: "OPEN", ownerId: users[3].id, dueDate: new Date(2026, 5, 30) } }),
  ]);

  // Badges
  await Promise.all([
    prisma.badge.create({ data: { name: "Green Starter", description: "Begin your sustainability journey", icon: "🌱", xpThreshold: 0, challengeThreshold: 0, tier: "Bronze" } }),
    prisma.badge.create({ data: { name: "Eco Warrior", description: "Earn 500 XP through sustainability efforts", icon: "⚔️", xpThreshold: 500, challengeThreshold: 0, tier: "Bronze" } }),
    prisma.badge.create({ data: { name: "Planet Protector", description: "Complete 3 sustainability challenges", icon: "🌍", xpThreshold: 0, challengeThreshold: 3, tier: "Silver" } }),
    prisma.badge.create({ data: { name: "Carbon Crusher", description: "Earn 1000 XP and complete 5 challenges", icon: "💪", xpThreshold: 1000, challengeThreshold: 5, tier: "Gold" } }),
    prisma.badge.create({ data: { name: "ESG Champion", description: "Earn 2000 XP through outstanding ESG contributions", icon: "🏆", xpThreshold: 2000, challengeThreshold: 0, tier: "Platinum" } }),
    prisma.badge.create({ data: { name: "Sustainability Legend", description: "Reach the pinnacle of ESG excellence", icon: "👑", xpThreshold: 5000, challengeThreshold: 10, tier: "Diamond" } }),
  ]);

  // Rewards
  await Promise.all([
    prisma.reward.create({ data: { name: "Eco-Friendly Water Bottle", description: "Premium stainless steel reusable water bottle", pointsRequired: 100, stock: 50, category: "Merchandise" } }),
    prisma.reward.create({ data: { name: "Tree Planted in Your Name", description: "A tree planted in a reforestation project", pointsRequired: 200, stock: 100, category: "Impact" } }),
    prisma.reward.create({ data: { name: "Reusable Lunch Kit", description: "Bamboo lunch box with utensils", pointsRequired: 300, stock: 30, category: "Merchandise" } }),
    prisma.reward.create({ data: { name: "Half Day Off", description: "Extra half day of paid time off", pointsRequired: 500, stock: 20, category: "Experience" } }),
    prisma.reward.create({ data: { name: "Eco Retreat Experience", description: "Weekend getaway to an eco-lodge", pointsRequired: 2000, stock: 5, category: "Experience" } }),
    prisma.reward.create({ data: { name: "Carbon Offset Certificate", description: "Offset 1 ton of CO2 through verified projects", pointsRequired: 750, stock: 50, category: "Impact" } }),
  ]);

  // Department Scores (historical)
  for (const dept of departments) {
    for (let m = 0; m < 6; m++) {
      const env = 40 + Math.random() * 50;
      const social = 30 + Math.random() * 60;
      const gov = 50 + Math.random() * 45;
      await prisma.departmentScore.create({
        data: {
          departmentId: dept.id,
          month: m + 1,
          year: 2026,
          environmentalScore: Math.round(env * 10) / 10,
          socialScore: Math.round(social * 10) / 10,
          governanceScore: Math.round(gov * 10) / 10,
          totalScore: Math.round(((env * 0.4 + social * 0.3 + gov * 0.3)) * 10) / 10,
        },
      });
    }
  }

  // Notifications
  await Promise.all([
    prisma.notification.create({ data: { userId: users[0].id, title: "Critical Compliance Issue", message: "A critical compliance issue has been raised: Supplier labor practice concern", type: "COMPLIANCE_ISSUE", link: "/governance/compliance" } }),
    prisma.notification.create({ data: { userId: users[0].id, title: "CSR Activity Pending", message: "Flood Relief Supplies activity is awaiting approval", type: "CSR_APPROVAL", link: "/social/csr" } }),
    prisma.notification.create({ data: { userId: users[6].id, title: "Badge Unlocked!", message: "Congratulations! You earned the Carbon Crusher badge", type: "BADGE_UNLOCK", link: "/gamification/badges" } }),
    prisma.notification.create({ data: { userId: users[2].id, title: "Challenge Update", message: "Your Zero Waste Week progress is at 60%", type: "CHALLENGE_APPROVAL", link: "/gamification/challenges" } }),
    prisma.notification.create({ data: { userId: users[0].id, title: "Policy Reminder", message: "Please review the updated Environmental Sustainability Policy", type: "POLICY_REMINDER", link: "/governance/policies" } }),
  ]);

  // Organization Profile
  await prisma.organizationProfile.create({
    data: {
      name: "EcoSphere Corp",
      industry: "Technology",
      employeeCount: 80,
      envWeight: 0.4,
      socialWeight: 0.3,
      govWeight: 0.3,
    },
  });

  // System Settings
  await Promise.all([
    prisma.systemSettings.create({ data: { key: "auto_emission_calculation", value: "false", description: "Auto-calculate carbon from ERP records" } }),
    prisma.systemSettings.create({ data: { key: "evidence_required", value: "true", description: "Require proof for CSR approval" } }),
    prisma.systemSettings.create({ data: { key: "badge_auto_award", value: "true", description: "Auto-award badges on unlock" } }),
  ]);

  console.log("Seed complete!");
  console.log(`Created ${departments.length} departments`);
  console.log(`Created ${users.length} users`);
  console.log(`Created ${csrActivities.length} CSR activities`);
  console.log(`Created ${challenges.length} challenges`);
  console.log(`Created ${policies.length} policies`);
  console.log(`Created ${audits.length} audits`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
