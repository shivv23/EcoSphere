import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const categoryRouter = router({
  list: protectedProcedure.input(z.object({ type: z.enum(["CSR_ACTIVITY", "CHALLENGE"]).optional() })).query(async ({ ctx, input }) => {
    const where = input.type ? { type: input.type } : {};
    return ctx.db.category.findMany({ where, orderBy: { name: "asc" } });
  }),
  create: protectedProcedure.input(z.object({ name: z.string().min(1), type: z.enum(["CSR_ACTIVITY", "CHALLENGE"]) })).mutation(async ({ ctx, input }) => {
    return ctx.db.category.create({ data: input });
  }),
  update: protectedProcedure.input(z.object({ id: z.string() }).passthrough()).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    return ctx.db.category.update({ where: { id }, data });
  }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.category.delete({ where: { id: input.id } });
  }),
});
