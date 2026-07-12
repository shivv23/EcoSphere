import { router } from "@/lib/trpc/server";
import { departmentRouter } from "./department";
import { categoryRouter } from "./category";
import { emissionFactorRouter } from "./emissionFactor";
import { policyRouter } from "./policy";
import { badgeRouter } from "./badge";
import { rewardRouter } from "./reward";
import { carbonTransactionRouter } from "./carbonTransaction";
import { csrActivityRouter } from "./csrActivity";
import { challengeRouter } from "./challenge";
import { auditRouter } from "./audit";
import { complianceRouter } from "./compliance";
import { dashboardRouter } from "./dashboard";
import { reportRouter } from "./report";
import { notificationRouter } from "./notification";
import { settingsRouter } from "./settings";
import { userRouter } from "./user";
import { importRouter } from "./import";
import { benchmarkRouter } from "./benchmark";
import { widgetRouter } from "./widget";
import { auditLogRouter } from "./auditLog";
import { thresholdRouter } from "./threshold";

export const appRouter = router({
  department: departmentRouter,
  category: categoryRouter,
  emissionFactor: emissionFactorRouter,
  policy: policyRouter,
  badge: badgeRouter,
  reward: rewardRouter,
  carbonTransaction: carbonTransactionRouter,
  csrActivity: csrActivityRouter,
  challenge: challengeRouter,
  audit: auditRouter,
  compliance: complianceRouter,
  dashboard: dashboardRouter,
  report: reportRouter,
  notification: notificationRouter,
  settings: settingsRouter,
  user: userRouter,
  import: importRouter,
  benchmark: benchmarkRouter,
  widget: widgetRouter,
  auditLog: auditLogRouter,
  threshold: thresholdRouter,
});

export type AppRouter = typeof appRouter;
