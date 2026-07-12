import { router } from "@/lib/trpc/server";
import { goalRouter } from "./goal";
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
import { recommendationRouter } from "./recommendation";
import { timelineRouter } from "./timeline";
import { supplierRouter } from "./supplier";
import { offsetRouter } from "./offset";
import { calendarRouter } from "./calendar";

export const appRouter = router({
  goal: goalRouter,
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
  recommendation: recommendationRouter,
  timeline: timelineRouter,
  supplier: supplierRouter,
  offset: offsetRouter,
  calendar: calendarRouter,
});

export type AppRouter = typeof appRouter;
