import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const settingsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const settings = await ctx.db.systemSettings.findMany();
    const org = await ctx.db.organizationProfile.findFirst();
    return { settings: Object.fromEntries(settings.map(s => [s.key, s.value])), organization: org };
  }),
  update: protectedProcedure.input(z.object({ key: z.string(), value: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.systemSettings.upsert({ where: { key: input.key }, create: input, update: { value: input.value } });
  }),
  updateOrg: protectedProcedure.input(z.object({ name: z.string().optional(), industry: z.string().optional(), employeeCount: z.number().optional(), envWeight: z.number().optional(), socialWeight: z.number().optional(), govWeight: z.number().optional() })).mutation(async ({ ctx, input }) => {
    const existing = await ctx.db.organizationProfile.findFirst();
    if (existing) return ctx.db.organizationProfile.update({ where: { id: existing.id }, data: input });
    return ctx.db.organizationProfile.create({ data: input as any });
  }),
});
