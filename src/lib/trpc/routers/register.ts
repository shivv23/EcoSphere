import { router, publicProcedure } from "@/lib/trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const registerRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (existing) {
        throw new Error("Email already registered");
      }
      const hashed = await bcrypt.hash(input.password, 12);
      return ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashed,
          phone: input.phone,
          role: "EMPLOYEE",
        },
      });
    }),
});
