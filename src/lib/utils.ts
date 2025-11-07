import { format, parseISO, isToday, isTomorrow } from "date-fns";
import type { Menu, MealSelection, Feedback } from "./types";

export const formatDate = (date: string, pattern = "EEEE, MMM d"): string =>
  format(parseISO(date), pattern);

export const formatTime = (iso: string): string =>
  format(parseISO(iso), "p");

export const isMenuForToday = (menu: Menu): boolean =>
  isToday(parseISO(menu.date));

export const isMenuForTomorrow = (menu: Menu): boolean =>
  isTomorrow(parseISO(menu.date));

export const getAggregateRating = (feedback: Feedback[]): number => {
  if (!feedback.length) {
    return 0;
  }
  const total = feedback.reduce((acc, item) => acc + item.rating, 0);
  return Number((total / feedback.length).toFixed(1));
};

interface WasteEstimationInput {
  optInCount: number;
  optOutCount: number;
  baselineWastePerMealKg?: number;
}

export const estimateWaste = ({
  optInCount,
  optOutCount,
  baselineWastePerMealKg = 0.08,
}: WasteEstimationInput): number => {
  const effectiveMeals = Math.max(optInCount - optOutCount * 0.1, 0);
  const wasteEstimate = effectiveMeals * baselineWastePerMealKg * 0.6;
  return Number(wasteEstimate.toFixed(2));
};

export const selectionStatusForMenu = (
  selections: MealSelection[],
  menuId: string,
) => selections.find((sel) => sel.menuId === menuId);
