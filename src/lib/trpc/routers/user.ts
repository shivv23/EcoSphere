import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const userRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      include: { department: true },
      orderBy: { name: "asc" },
    });
  }),
  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return ctx.db.user.findUnique({
      where: { id: input.id },
      include: { department: true, badgeAssignments: { include: { badge: true } } },
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]).optional(),
        departmentId: z.string().optional(),
        phone: z.string().optional(),
        gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]).optional(),
        ethnicity: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const hashed = await bcrypt.hash(input.password, 12);
      return ctx.db.user.create({
        data: { ...input, password: hashed },
      });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.string() }).passthrough())
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.user.update({ where: { id }, data });
    }),
  xp: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      select: { id: true, name: true, xp: true, department: { select: { name: true } } },
      orderBy: { xp: "desc" },
    });
  }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.user.delete({ where: { id: input.id } });
  }),
});
