import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const notificationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.notification.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  }),
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.notification.count({ where: { userId: ctx.user.id, read: false } });
  }),
  markRead: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.notification.update({ where: { id: input.id }, data: { read: true } });
  }),
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.db.notification.updateMany({ where: { userId: ctx.user.id, read: false }, data: { read: true } });
  }),
  create: protectedProcedure.input(z.object({ userId: z.string(), title: z.string(), message: z.string(), type: z.enum(["COMPLIANCE_ISSUE", "CSR_APPROVAL", "CHALLENGE_APPROVAL", "POLICY_REMINDER", "BADGE_UNLOCK", "REWARD_REDEMPTION", "GENERAL"]).default("GENERAL"), link: z.string().optional() })).mutation(async ({ ctx, input }) => {
    return ctx.db.notification.create({ data: input });
  }),
});
