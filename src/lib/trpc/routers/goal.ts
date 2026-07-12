import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const goalRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.environmentalGoal.findMany({ orderBy: { createdAt: "desc" } });
  }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        targetValue: z.number().min(0),
        currentValue: z.number().default(0),
        unit: z.string().min(1),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.environmentalGoal.create({ data: input });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.string() }).passthrough())
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.environmentalGoal.update({ where: { id }, data });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.environmentalGoal.delete({ where: { id: input.id } });
    }),
});
