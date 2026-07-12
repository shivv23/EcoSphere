import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const offsetRouter = router({
  projects: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.carbonOffsetProject.findMany({ where: { status: "ACTIVE" }, orderBy: { pricePerTon: "asc" } });
  }),
  purchase: protectedProcedure
    .input(z.object({ projectId: z.string(), tons: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.carbonOffsetProject.findUnique({ where: { id: input.projectId } });
      if (!project || project.availableTons < input.tons) throw new Error("Insufficient tons available");
      const totalCost = input.tons * project.pricePerTon;
      await ctx.db.carbonOffsetProject.update({
        where: { id: input.projectId },
        data: { availableTons: { decrement: input.tons } },
      });
      return ctx.db.carbonOffsetPurchase.create({
        data: { projectId: input.projectId, tonsPurchased: input.tons, totalCost, userId: ctx.user.id },
      });
    }),
  myPurchases: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.carbonOffsetPurchase.findMany({
      where: { userId: ctx.user.id },
      include: { project: true },
      orderBy: { purchasedAt: "desc" },
    });
  }),
  stats: protectedProcedure.query(async ({ ctx }) => {
    const purchases = await ctx.db.carbonOffsetPurchase.findMany({ where: { userId: ctx.user.id } });
    const totalTons = purchases.reduce((sum, p) => sum + p.tonsPurchased, 0);
    const totalSpent = purchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalCarbon = await ctx.db.carbonTransaction.aggregate({ _sum: { totalEmissions: true } });
    const carbon = totalCarbon._sum.totalEmissions || 0;
    return { totalTons, totalSpent, offsetPercentage: carbon > 0 ? Math.round((totalTons / carbon) * 100) : 0, totalCarbon: carbon };
  }),
});
