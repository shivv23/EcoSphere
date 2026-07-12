import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const auditLogRouter = router({
  list: protectedProcedure
    .input(z.object({ entity: z.string().optional(), userId: z.string().optional(), limit: z.number().default(50) }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input?.entity) where.entity = input.entity;
      if (input?.userId) where.userId = input.userId;
      return ctx.db.auditLog.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: input?.limit || 50,
      });
    }),
  log: protectedProcedure
    .input(z.object({ action: z.string(), entity: z.string(), entityId: z.string().optional(), details: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.auditLog.create({
        data: { ...input, userId: ctx.user.id },
      });
    }),
});
