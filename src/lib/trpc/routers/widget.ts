import { router, protectedProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const widgetRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const widgets = await ctx.db.dashboardWidget.findMany({
      where: { userId: ctx.user.id },
      orderBy: { position: "asc" },
    });
    if (widgets.length === 0) {
      const defaults = [
        { widgetId: "kpi-carbon", title: "Carbon Emissions", type: "kpi", visible: true, position: 0, size: "medium" },
        { widgetId: "kpi-employees", title: "Active Employees", type: "kpi", visible: true, position: 1, size: "medium" },
        { widgetId: "kpi-csr", title: "CSR Activities", type: "kpi", visible: true, position: 2, size: "medium" },
        { widgetId: "kpi-challenges", title: "Open Challenges", type: "kpi", visible: true, position: 3, size: "medium" },
        { widgetId: "chart-carbon", title: "Carbon Trends", type: "chart", visible: true, position: 4, size: "large" },
        { widgetId: "chart-departments", title: "Department Scores", type: "chart", visible: true, position: 5, size: "large" },
        { widgetId: "list-activities", title: "Recent Activities", type: "list", visible: true, position: 6, size: "medium" },
        { widgetId: "list-top-employees", title: "Top Employees", type: "list", visible: true, position: 7, size: "medium" },
        { widgetId: "list-compliance", title: "Compliance Issues", type: "list", visible: true, position: 8, size: "medium" },
      ];
      for (const w of defaults) {
        await ctx.db.dashboardWidget.create({ data: { ...w, userId: ctx.user.id } });
      }
      return defaults.map((w, i) => ({ ...w, id: `default-${i}`, userId: ctx.user.id, createdAt: new Date(), updatedAt: new Date() }));
    }
    return widgets;
  }),
  update: protectedProcedure
    .input(z.object({ id: z.string(), visible: z.boolean().optional(), position: z.number().optional(), size: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.dashboardWidget.update({ where: { id }, data });
    }),
  reorder: protectedProcedure
    .input(z.object({ widgets: z.array(z.object({ id: z.string(), position: z.number() })) }))
    .mutation(async ({ ctx, input }) => {
      for (const w of input.widgets) {
        await ctx.db.dashboardWidget.update({ where: { id: w.id }, data: { position: w.position } });
      }
      return { success: true };
    }),
});
