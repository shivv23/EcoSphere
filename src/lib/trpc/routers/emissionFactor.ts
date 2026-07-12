import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const emissionFactorRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.emissionFactor.findMany({ orderBy: { name: "asc" } });
  }),
  create: protectedProcedure.input(z.object({ name: z.string().min(1), source: z.string().min(1), factor: z.number().positive(), unit: z.string().min(1), scope: z.number().min(1).max(3).default(1) })).mutation(async ({ ctx, input }) => {
    return ctx.db.emissionFactor.create({ data: input });
  }),
  update: protectedProcedure.input(z.object({ id: z.string() }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    return ctx.db.emissionFactor.update({ where: { id }, data });
  }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.emissionFactor.delete({ where: { id: input.id } });
  }),
});
