import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const supplierRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.supplier.findMany({
      include: { assessments: { orderBy: { assessmentDate: "desc" }, take: 1 } },
      orderBy: { esgScore: "desc" },
    });
  }),
  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return ctx.db.supplier.findUnique({
      where: { id: input.id },
      include: { assessments: { orderBy: { assessmentDate: "desc" } } },
    });
  }),
  create: protectedProcedure
    .input(z.object({ name: z.string(), contactEmail: z.string().optional(), contactPerson: z.string().optional(), country: z.string().optional(), category: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.supplier.create({ data: input });
    }),
  assess: protectedProcedure
    .input(z.object({ supplierId: z.string(), envScore: z.number(), socialScore: z.number(), govScore: z.number(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const totalScore = Math.round((input.envScore * 0.4 + input.socialScore * 0.3 + input.govScore * 0.3) * 10) / 10;
      const assessment = await ctx.db.supplierAssessment.create({
        data: { ...input, totalScore, assessorId: ctx.user.id },
      });
      await ctx.db.supplier.update({
        where: { id: input.supplierId },
        data: { esgScore: totalScore, envScore: input.envScore, socialScore: input.socialScore, govScore: input.govScore },
      });
      return assessment;
    }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.supplier.delete({ where: { id: input.id } });
  }),
});
