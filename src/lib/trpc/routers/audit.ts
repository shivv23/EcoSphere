import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const auditRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.audit.findMany({ include: { _count: { select: { complianceIssues: true } } }, orderBy: { auditDate: "desc" } });
  }),
  create: protectedProcedure.input(z.object({ title: z.string().min(1), description: z.string().optional(), auditDate: z.date().default(new Date()), score: z.number().min(0).max(100).optional() })).mutation(async ({ ctx, input }) => {
    return ctx.db.audit.create({ data: input });
  }),
  update: protectedProcedure.input(z.object({ id: z.string() }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    return ctx.db.audit.update({ where: { id }, data });
  }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.audit.delete({ where: { id: input.id } });
  }),
});
