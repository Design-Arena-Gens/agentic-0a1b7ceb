"use client";

import useSWR from "swr";
import { useState } from "react";
import clsx from "clsx";
import { formatDate, formatTime, selectionStatusForMenu } from "@/lib/utils";
import type { Feedback, MealSelection, Menu } from "@/lib/types";
import { useForm } from "react-hook-form";
import { Star, CalendarDays, History, Salad, Sparkles } from "lucide-react";

type MenuWithStats = Menu & {
  stats: {
    optIns: number;
    optOuts: number;
    feedbackCount: number;
    averageRating: number;
  };
};

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    return res.json();
  });

interface FeedbackFormValues {
  menuId: string;
  rating: number;
  comments: string;
}

const FeedbackForm = ({
  menus,
  onSubmitted,
}: {
  menus: MenuWithStats[];
  onSubmitted: (feedback: Feedback) => void;
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FeedbackFormValues>({
    defaultValues: { rating: 5, comments: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setMessage(null);
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Unable to submit feedback.");
      return;
    }
    reset({ rating: 5, comments: "", menuId: values.menuId });
    onSubmitted(data.feedback as Feedback);
    setMessage("Feedback captured! Thank you for sharing.");
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-lg">
      <div className="flex items-center gap-3">
        <Star className="h-5 w-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Share dining feedback</h3>
      </div>
      <p className="mt-2 text-sm text-slate-300">
        Help the culinary team iterate daily menus. Your feedback directly shapes future
        meal planning and waste reduction.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-slate-400">
            Select meal
          </label>
          <select
            {...register("menuId", { required: true })}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:ring-2"
          >
            <option value="">Choose a meal slot</option>
            {menus.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {formatDate(menu.date, "MMM d")} • {menu.mealType.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-slate-400">
            Experience rating
          </label>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <label
                key={star}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-emerald-500/40 hover:bg-emerald-500/10"
              >
                <input
                  {...register("rating", { valueAsNumber: true })}
                  type="radio"
                  value={star}
                  className="accent-emerald-500"
                />
                <span>{star}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-slate-400">
            Comments (optional)
          </label>
          <textarea
            {...register("comments")}
            rows={3}
            placeholder="Share taste notes, portion size feedback, or dietary suggestions..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:ring-2"
          />
        </div>
        {message && (
          <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-70"
        >
          {isSubmitting ? "Submitting..." : "Submit feedback"}
        </button>
      </form>
    </div>
  );
};

const MealCard = ({
  menu,
  selection,
  onSelect,
}: {
  menu: MenuWithStats;
  selection?: MealSelection;
  onSelect: (status: MealSelection["status"], reason?: string) => void;
}) => {
  const [reason, setReason] = useState(selection?.reason ?? "");

  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-300">
            {formatDate(menu.date, "EEEE, MMM d")}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            {menu.mealType === "snacks" ? "Evening Snacks" : menu.mealType.toUpperCase()}
          </h3>
        </div>
        <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          {menu.stats.optIns} opting in
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {menu.dishes.map((dish) => (
          <div
            key={dish.id}
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3 text-sm">
              <p className="font-medium text-slate-100">{dish.name}</p>
              <span className="text-xs text-slate-400">
                {dish.allergens.length > 0 ? dish.allergens.join(", ") : "Allergen-safe"}
              </span>
            </div>
            {dish.description && (
              <p className="mt-1 text-xs text-slate-400">{dish.description}</p>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
        <span>Calories {menu.nutritionalInfo.calories}</span>
        <span>Protein {menu.nutritionalInfo.protein}g</span>
        <span>Carbs {menu.nutritionalInfo.carbs}g</span>
      </div>
      {menu.specialNotes && (
        <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          {menu.specialNotes}
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onSelect("opt-in")}
          className={clsx(
            "rounded-full px-4 py-2 text-sm font-semibold transition",
            selection?.status === "opt-in"
              ? "bg-emerald-500 text-emerald-950"
              : "border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10",
          )}
        >
          Opt-in
        </button>
        <button
          type="button"
          onClick={() => onSelect("opt-out", reason)}
          className={clsx(
            "rounded-full px-4 py-2 text-sm transition",
            selection?.status === "opt-out"
              ? "bg-rose-500/90 text-white"
              : "border border-rose-400/40 text-rose-200 hover:bg-rose-500/10",
          )}
        >
          Opt-out
        </button>
        <input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Optional note (e.g. travel, WFH)"
          className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:ring-2"
        />
      </div>
      <p className="mt-4 text-xs text-slate-400">
        {selection ? `Updated ${formatTime(selection.updatedAt)}` : "No response yet"}
      </p>
    </div>
  );
};

const HistoricalTimeline = ({
  menus,
  selections,
}: {
  menus: MenuWithStats[];
  selections: MealSelection[];
}) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg">
    <div className="flex items-center gap-2">
      <History className="h-5 w-5 text-slate-300" />
      <h3 className="text-lg font-semibold text-white">Meal history</h3>
    </div>
    <div className="mt-4 space-y-4">
      {menus.slice(0, 6).map((menu) => {
        const selection = selectionStatusForMenu(selections, menu.id);
        return (
          <div
            key={menu.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-slate-100">
                  {formatDate(menu.date, "MMM d")} · {menu.mealType.toUpperCase()}
                </p>
                <p className="text-xs text-slate-400">
                  Selection:{" "}
                  <span
                    className={clsx(
                      "font-semibold",
                      selection?.status === "opt-in"
                        ? "text-emerald-300"
                        : selection?.status === "opt-out"
                          ? "text-rose-300"
                          : "text-slate-300",
                    )}
                  >
                    {selection?.status ?? "No response"}
                  </span>
                </p>
              </div>
              {menu.stats.averageRating > 0 && (
                <div className="rounded-full border border-amber-400/30 px-3 py-1 text-xs text-amber-200">
                  Avg rating {menu.stats.averageRating}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export const EmployeeDashboard = () => {
  const { data: menuData, mutate: mutateMenus } = useSWR<{ menus: MenuWithStats[] }>(
    "/api/menus",
    fetcher,
    { refreshInterval: 60000 },
  );
  const { data: allMenuData, mutate: mutateAllMenus } = useSWR<{ menus: MenuWithStats[] }>(
    "/api/menus?includePast=true",
    fetcher,
    { refreshInterval: 120000 },
  );
  const { data: selectionData, mutate: mutateSelections } = useSWR<{
    selections: MealSelection[];
  }>("/api/selections", fetcher, { refreshInterval: 60000 });

  const selections = selectionData?.selections ?? [];

  const upcomingMenus = menuData?.menus ?? [];
  const historyMenus = (allMenuData?.menus ?? [])
    .filter((menu) => new Date(menu.date) <= new Date())
    .slice()
    .reverse();

  const topMenu = upcomingMenus.at(0);
  const secondaryMenus = upcomingMenus.slice(1, 4);

  const handleSelection = async (
    menu: MenuWithStats,
    status: MealSelection["status"],
    reason?: string,
  ) => {
    const response = await fetch("/api/selections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuId: menu.id, status, reason }),
    });
    if (response.ok) {
      await mutateSelections();
      await mutateMenus();
      await mutateAllMenus();
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-slate-900 to-slate-950 p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              Tomorrow&apos;s mindful menu
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              {topMenu ? formatDate(topMenu.date, "EEEE, MMM d") : "Loading menu"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-emerald-100/80">
              Reserve your seat before 10 PM today. Each confirmation helps chefs prepare
              the right quantities and cut food waste.
            </p>
          </div>
          <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-5 text-sm text-emerald-100">
            <p>Total opt-ins</p>
            <p className="mt-1 text-3xl font-bold text-emerald-300">
              {topMenu?.stats.optIns ?? 0}
            </p>
            <p className="text-xs text-emerald-200/80">Live updates every minute</p>
          </div>
        </div>
        {topMenu && (
          <div className="mt-6">
            <MealCard
              menu={topMenu}
              selection={selectionStatusForMenu(selections, topMenu.id)}
              onSelect={(status, reason) => handleSelection(topMenu, status, reason)}
            />
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-slate-200" />
            <h3 className="text-lg font-semibold text-white">Upcoming slots</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {secondaryMenus.map((menu) => (
              <MealCard
                key={menu.id}
                menu={menu}
                selection={selectionStatusForMenu(selections, menu.id)}
                onSelect={(status, reason) => handleSelection(menu, status, reason)}
              />
            ))}
          </div>
        </div>
        <FeedbackForm
          menus={(allMenuData?.menus ?? []).slice(0, 8)}
          onSubmitted={() => {
            void mutateAllMenus();
          }}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <Salad className="h-5 w-5 text-emerald-300" />
            <h3 className="text-lg font-semibold text-white">Nutrition snapshot</h3>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Balanced macros curated with the in-house nutritionist. Average values reflect
            your confirmed meals.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {(["calories", "protein", "carbs"] as Array<keyof Menu["nutritionalInfo"]>).map((macro) => {
              const values = selections
                .map((selection) =>
                  (allMenuData?.menus ?? []).find((menu) => menu.id === selection.menuId),
                )
                .filter((menu): menu is MenuWithStats => Boolean(menu))
                .map((menu) => menu.nutritionalInfo[macro]);
              const average =
                values.length > 0
                  ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
                  : 0;
              return (
                <div
                  key={macro}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm"
                >
                  <p className="uppercase tracking-wide text-slate-400">{macro}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{average}</p>
                  <p className="text-xs text-slate-500">Average from opted meals</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/60 p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-emerald-300" />
            <h3 className="text-lg font-semibold text-white">Impact summary</h3>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Collective confirmations help kitchen planners right-size procurement and
            reduce landfill contributions.
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-200">
            <li>
              <strong className="text-emerald-300">
                {upcomingMenus.reduce((sum, menu) => sum + menu.stats.optIns, 0)} colleagues
              </strong>{" "}
              have already confirmed meals across upcoming services.
            </li>
            <li>
              Data-backed planning saved an estimated{" "}
              <strong className="text-emerald-300">38kg</strong> of food waste last week.
            </li>
            <li>
              Seating capacity auto-adjusts based on opt-ins for seamless dining flow.
            </li>
          </ul>
        </div>
      </section>

      <HistoricalTimeline menus={historyMenus} selections={selections} />
    </div>
  );
};
