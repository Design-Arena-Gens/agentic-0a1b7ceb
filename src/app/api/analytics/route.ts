import { NextResponse } from "next/server";
import {
  computeDashboardMetrics,
  getFeedback,
  getMenus,
  getSelections,
} from "@/lib/store";
import { getSessionUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const metrics = computeDashboardMetrics();
  const menus = getMenus({ includePast: true });
  const selections = getSelections();
  const feedback = getFeedback();

  const byDateMap = new Map<
    string,
    { optIns: number; optOuts: number; feedbackCount: number; scoreTotal: number }
  >();

  menus.forEach((menu) => {
    const label = formatDate(menu.date, "MMM d");
    if (!byDateMap.has(label)) {
      byDateMap.set(label, { optIns: 0, optOuts: 0, feedbackCount: 0, scoreTotal: 0 });
    }
    const entry = byDateMap.get(label)!;
    selections
      .filter((selection) => selection.menuId === menu.id)
      .forEach((selection) => {
        if (selection.status === "opt-in") {
          entry.optIns += 1;
        } else {
          entry.optOuts += 1;
        }
      });
    feedback
      .filter((item) => item.menuId === menu.id)
      .forEach((item) => {
        entry.feedbackCount += 1;
        entry.scoreTotal += item.rating;
      });
  });

  const trend = Array.from(byDateMap.entries()).map(([label, values]) => ({
    label,
    optIns: values.optIns,
    optOuts: values.optOuts,
    averageRating: values.feedbackCount
      ? Number((values.scoreTotal / values.feedbackCount).toFixed(1))
      : 0,
  }));

  const topMenus = menus
    .map((menu) => {
      const feedbackForMenu = feedback.filter((item) => item.menuId === menu.id);
      const selectionsForMenu = selections.filter(
        (selection) => selection.menuId === menu.id,
      );
      const averageRating = feedbackForMenu.length
        ? Number(
            (
              feedbackForMenu.reduce((acc, item) => acc + item.rating, 0) /
              feedbackForMenu.length
            ).toFixed(1),
          )
        : 0;
      return {
        id: menu.id,
        date: menu.date,
        mealType: menu.mealType,
        averageRating,
        totalFeedback: feedbackForMenu.length,
        optIns: selectionsForMenu.filter((item) => item.status === "opt-in").length,
      };
    })
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 5);

  return NextResponse.json({ metrics, trend, topMenus });
}
