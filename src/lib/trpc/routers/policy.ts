import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const policyRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.eSGPolicy.findMany({
      include: { _count: { select: { acknowledgements: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),
  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return ctx.db.eSGPolicy.findUnique({ where: { id: input.id }, include: { acknowledgements: { include: { employee: true } } } });
  }),
  create: protectedProcedure.input(z.object({ title: z.string().min(1), description: z.string().min(1), category: z.string().default("General"), version: z.string().default("1.0"), effectiveDate: z.date(), reviewDate: z.date().optional() })).mutation(async ({ ctx, input }) => {
    return ctx.db.eSGPolicy.create({ data: input });
  }),
  update: protectedProcedure.input(z.object({ id: z.string() }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    return ctx.db.eSGPolicy.update({ where: { id }, data });
  }),
  acknowledge: protectedProcedure.input(z.object({ policyId: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.policyAcknowledgement.upsert({
      where: { employeeId_policyId: { employeeId: ctx.user.id, policyId: input.policyId } },
      create: { employeeId: ctx.user.id, policyId: input.policyId },
      update: {},
    });
  }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.eSGPolicy.delete({ where: { id: input.id } });
  }),
});
