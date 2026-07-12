import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const carbonTransactionRouter = router({
  list: protectedProcedure.input(z.object({ departmentId: z.string().optional(), scope: z.number().optional() }).optional()).query(async ({ ctx, input }) => {
    const where: any = {};
    if (input?.departmentId) where.departmentId = input.departmentId;
    if (input?.scope) where.scope = input.scope;
    return ctx.db.carbonTransaction.findMany({ where, include: { department: true, emissionFactor: true }, orderBy: { date: "desc" } });
  }),
  create: protectedProcedure.input(z.object({ departmentId: z.string(), emissionFactorId: z.string().optional(), productESGProfileId: z.string().optional(), source: z.string().min(1), quantity: z.number().positive(), totalEmissions: z.number().positive(), scope: z.number().min(1).max(3).default(1), notes: z.string().optional(), date: z.date().optional() })).mutation(async ({ ctx, input }) => {
    return ctx.db.carbonTransaction.create({ data: input });
  }),
  totals: protectedProcedure.query(async ({ ctx }) => {
    const transactions = await ctx.db.carbonTransaction.groupBy({ by: ["scope"], _sum: { totalEmissions: true }, _count: true });
    const byDept = await ctx.db.carbonTransaction.groupBy({ by: ["departmentId"], _sum: { totalEmissions: true } });
    return { byScope: transactions, byDepartment: byDept };
  }),
  monthly: protectedProcedure.query(async ({ ctx }) => {
    const transactions = await ctx.db.carbonTransaction.findMany({ orderBy: { date: "asc" } });
    const monthly: Record<string, { scope1: number; scope2: number; scope3: number }> = {};
    transactions.forEach((t) => {
      const key = t.date.toISOString().slice(0, 7);
      if (!monthly[key]) monthly[key] = { scope1: 0, scope2: 0, scope3: 0 };
      if (t.scope === 1) monthly[key].scope1 += t.totalEmissions;
      else if (t.scope === 2) monthly[key].scope2 += t.totalEmissions;
      else monthly[key].scope3 += t.totalEmissions;
    });
    return Object.entries(monthly).map(([month, data]) => ({ month, ...data }));
  }),
});
