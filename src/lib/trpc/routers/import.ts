import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const importRouter = router({
  importData: protectedProcedure
    .input(z.object({
      entity: z.string(),
      data: z.array(z.record(z.string(), z.any())),
    }))
    .mutation(async ({ ctx, input }) => {
      let imported = 0;
      const { entity, data } = input;
      
      for (const row of data) {
        try {
          if (entity === "carbonTransactions") {
            const dateVal = row.date || row.Date;
            await ctx.db.carbonTransaction.create({
              data: {
                source: String(row.source || row.Source || ""),
                quantity: Number(row.quantity || row.Quantity || 0),
                totalEmissions: Number(row.totalEmissions || row.Total || row.emissions || 0),
                scope: Number(row.scope || row.Scope || 1),
                departmentId: String(row.departmentId || row.department_id || ""),
                date: dateVal ? new Date(String(dateVal)) : new Date(),
                notes: row.notes || row.Notes || null,
              },
            });
            imported++;
          } else if (entity === "users") {
            await ctx.db.user.create({
              data: {
                name: String(row.name || row.Name || ""),
                email: String(row.email || row.Email || ""),
                password: "$2a$12$LJ3m4ys4Lg.Ky0VbVvGJUeKJGz3GqJqN9Y8vGzQxPpK7G5B2hC1iG",
                role: (String(row.role || row.Role || "EMPLOYEE") as "ADMIN" | "MANAGER" | "EMPLOYEE"),
                departmentId: String(row.departmentId || row.department_id || ""),
              },
            });
            imported++;
          } else if (entity === "departments") {
            await ctx.db.department.create({
              data: {
                name: String(row.name || row.Name || ""),
                code: String(row.code || row.Code || ""),
                employeeCount: Number(row.employeeCount || row.EmployeeCount || 0),
              },
            });
            imported++;
          } else if (entity === "csrActivities") {
            await ctx.db.cSRActivity.create({
              data: {
                title: String(row.title || row.Title || ""),
                description: String(row.description || row.Description || ""),
                departmentId: String(row.departmentId || row.department_id || ""),
                categoryId: String(row.categoryId || row.category_id || ""),
                organizerId: String(row.organizerId || row.organizer_id || ""),
                location: String(row.location || row.Location || ""),
                status: "PENDING",
              },
            });
            imported++;
          }
        } catch (err) {
          // skip bad rows
        }
      }
      
      return { imported, total: data.length };
    }),
});
