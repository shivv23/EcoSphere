import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const departmentRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.department.findMany({
      include: { _count: { select: { users: true }, }, departmentScores: { orderBy: { calculatedAt: "desc" }, take: 1 } },
      orderBy: { name: "asc" },
    });
  }),
  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return ctx.db.department.findUnique({ where: { id: input.id }, include: { users: true, departmentScores: { orderBy: { calculatedAt: "desc" }, take: 12 } } });
  }),
  create: protectedProcedure.input(z.object({ name: z.string().min(1), code: z.string().min(1), headId: z.string().optional() })).mutation(async ({ ctx, input }) => {
    return ctx.db.department.create({ data: input });
  }),
  update: protectedProcedure.input(z.object({ id: z.string() }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    return ctx.db.department.update({ where: { id }, data });
  }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.department.delete({ where: { id: input.id } });
  }),
  scores: protectedProcedure.input(z.object({ departmentId: z.string() })).query(async ({ ctx, input }) => {
    return ctx.db.departmentScore.findMany({ where: { departmentId: input.departmentId }, orderBy: { calculatedAt: "desc" }, take: 12 });
  }),
});
