"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { formatDate } from "@/lib/utils";
import type { Menu } from "@/lib/types";
import {
  ChefHat,
  PieChart,
  BarChart3,
  Utensils,
  ClipboardList,
  AlertTriangle,
  Inbox,
  Plus,
  Trash,
} from "lucide-react";
import clsx from "clsx";
import { useNotifications } from "@/hooks/use-notifications";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  });

interface AnalyticsResponse {
  metrics: {
    totalOptIns: number;
    totalOptOuts: number;
    optInRate: number;
    averageRating: number;
    wasteEstimateKg: number;
  };
  trend: Array<{
    label: string;
    optIns: number;
    optOuts: number;
    averageRating: number;
  }>;
  topMenus: Array<{
    id: string;
    date: string;
    mealType: string;
    averageRating: number;
    totalFeedback: number;
    optIns: number;
  }>;
}

const MetricCard = ({
  title,
  value,
  subtitle,
  variant = "default",
}: {
  title: string;
  value: string;
  subtitle: string;
  variant?: "default" | "success" | "warning";
}) => (
  <div
    className={clsx(
      "rounded-3xl border px-5 py-6 shadow-xl",
      variant === "success"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
        : variant === "warning"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
          : "border-slate-800 bg-slate-950/60 text-slate-100",
    )}
  >
    <p className="text-xs uppercase tracking-widest text-slate-400">{title}</p>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
  </div>
);

interface MenuFormValues {
  date: string;
  mealType: "breakfast" | "lunch" | "snacks";
  specialNotes: string;
  dishes: Array<{
    name: string;
    description: string;
    ingredients: string;
    allergens: string;
  }>;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

const defaultDish = {
  name: "",
  description: "",
  ingredients: "",
  allergens: "",
};

const defaultMenuValues: MenuFormValues = {
  date: "",
  mealType: "lunch",
  specialNotes: "",
  dishes: [defaultDish],
  nutritionalInfo: {
    calories: 450,
    protein: 18,
    carbs: 55,
    fats: 14,
  },
};

const MenuConfiguration = ({
  onCreated,
  menus,
}: {
  onCreated: (menu: Menu) => void;
  menus: Menu[];
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<MenuFormValues>({
    defaultValues: defaultMenuValues,
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "dishes",
  });

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      ...values,
      dishes: values.dishes.map((dish) => ({
        name: dish.name,
        description: dish.description,
        ingredients: dish.ingredients.split(",").map((item) => item.trim()),
        allergens: dish.allergens.split(",").map((item) => item.trim()).filter(Boolean),
      })),
    };
    const response = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (response.ok) {
      onCreated(data.menu as Menu);
      reset(defaultMenuValues);
    }
  });

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl">
      <div className="flex items-center gap-3">
        <ChefHat className="h-5 w-5 text-emerald-300" />
        <h3 className="text-lg font-semibold text-white">Curate new menu</h3>
      </div>
      <p className="mt-2 text-sm text-slate-300">
        Configure mindful meals with allergen transparency and nutrition macros.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase text-slate-400">Date</label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:ring-2"
              {...register("date", { required: true })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase text-slate-400">
              Meal type
            </label>
            <select
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:ring-2"
              {...register("mealType", { required: true })}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="snacks">Evening snacks</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-slate-400">
            Special notes
          </label>
          <textarea
            rows={2}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none ring-emerald-500/40 focus:ring-2"
            placeholder="Highlight sustainable sourcing, chef stories, or dietary accommodations"
            {...register("specialNotes")}
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium uppercase text-slate-400">
              Dishes
            </label>
            <button
              type="button"
              onClick={() => append(defaultDish)}
              className="flex items-center gap-2 rounded-full border border-emerald-500/40 px-3 py-1 text-xs font-medium text-emerald-200 hover:bg-emerald-500/10"
            >
              <Plus className="h-3.5 w-3.5" />
              Add dish
            </button>
          </div>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Dish {index + 1}
                </p>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-xs text-slate-400 hover:text-rose-300"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input
                  placeholder="Name"
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                  {...register(`dishes.${index}.name`, { required: true })}
                />
                <input
                  placeholder="Description"
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                  {...register(`dishes.${index}.description`)}
                />
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input
                  placeholder="Ingredients (comma separated)"
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                  {...register(`dishes.${index}.ingredients`)}
                />
                <input
                  placeholder="Allergens (comma separated)"
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                  {...register(`dishes.${index}.allergens`)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs uppercase text-slate-500">Calories</label>
            <Controller
              name="nutritionalInfo.calories"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  {...field}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              )}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase text-slate-500">Protein</label>
            <Controller
              name="nutritionalInfo.protein"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  {...field}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              )}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase text-slate-500">Carbs</label>
            <Controller
              name="nutritionalInfo.carbs"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  {...field}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              )}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase text-slate-500">Fats</label>
            <Controller
              name="nutritionalInfo.fats"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  {...field}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              )}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-70"
        >
          {isSubmitting ? "Publishing..." : "Publish menu"}
        </button>
      </form>
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400">
        <p>{menus.length} meal services configured over the next week.</p>
      </div>
    </div>
  );
};

const InventoryManager = ({
  items,
  refresh,
}: {
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    threshold: number;
    updatedAt: string;
    notes?: string;
  }>;
  refresh: () => void;
}) => {
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 10,
    unit: "kg",
    threshold: 5,
    notes: "",
  });

  const handleAdjust = async (
    item: (typeof items)[number],
    update: Partial<(typeof items)[number]>,
  ) => {
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, ...update }),
    });
    refresh();
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "delete" }),
    });
    refresh();
  };

  const handleCreate = async () => {
    if (!newItem.name.trim()) return;
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    setNewItem({ name: "", quantity: 10, unit: "kg", threshold: 5, notes: "" });
    refresh();
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-5 w-5 text-emerald-300" />
        <h3 className="text-lg font-semibold text-white">Pantry intelligence</h3>
      </div>
      <p className="mt-2 text-sm text-slate-300">
        Track critical stock levels with procurement nudges for sustainable sourcing.
      </p>
      <div className="mt-5 space-y-4">
        {items.map((item) => {
          const isLow = item.quantity < item.threshold;
          return (
            <div
              key={item.id}
              className={clsx(
                "rounded-2xl border px-4 py-3 text-sm",
                isLow
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-100"
                  : "border-slate-800 bg-slate-900/60 text-slate-200",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-slate-300">
                    {item.quantity} {item.unit} · Reorder at {item.threshold} {item.unit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleAdjust(item, {
                        quantity: Math.max(item.quantity - 5, 0),
                      })
                    }
                    className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAdjust(item, {
                        quantity: item.quantity + 5,
                      })
                    }
                    className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-full border border-rose-500/40 bg-rose-500/20 p-2 text-rose-200 hover:bg-rose-500/30"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {item.notes && (
                <p className="mt-2 text-xs text-slate-200/80">{item.notes}</p>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Add inventory item
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            value={newItem.name}
            onChange={(event) =>
              setNewItem((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="Item name"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <input
            value={newItem.unit}
            onChange={(event) =>
              setNewItem((prev) => ({ ...prev, unit: event.target.value }))
            }
            placeholder="Unit"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            type="number"
            value={newItem.quantity}
            onChange={(event) =>
              setNewItem((prev) => ({
                ...prev,
                quantity: Number(event.target.value),
              }))
            }
            placeholder="Quantity"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <input
            type="number"
            value={newItem.threshold}
            onChange={(event) =>
              setNewItem((prev) => ({
                ...prev,
                threshold: Number(event.target.value),
              }))
            }
            placeholder="Reorder threshold"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>
        <textarea
          value={newItem.notes}
          onChange={(event) =>
            setNewItem((prev) => ({ ...prev, notes: event.target.value }))
          }
          placeholder="Notes (optional)"
          rows={2}
          className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
        <button
          type="button"
          onClick={handleCreate}
          className="mt-3 w-full rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
        >
          Add item
        </button>
      </div>
    </div>
  );
};

export const AdminDashboard = () => {
  const { data: analytics, mutate: mutateAnalytics } = useSWR<AnalyticsResponse>(
    "/api/analytics",
    fetcher,
    { refreshInterval: 60000 },
  );
  const { data: menus, mutate: mutateMenus } = useSWR<{ menus: Menu[] }>(
    "/api/menus?includePast=true",
    fetcher,
    { refreshInterval: 60000 },
  );
  const { data: inventory, mutate: mutateInventory } = useSWR<{
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      unit: string;
      threshold: number;
      updatedAt: string;
      notes?: string;
    }>;
  }>("/api/inventory", fetcher, { refreshInterval: 60000 });
  const { createNotification } = useNotifications();

  const upcoming = useMemo(
    () =>
      (menus?.menus ?? []).filter(
        (menu) => new Date(menu.date) >= new Date(new Date().toDateString()),
      ),
    [menus?.menus],
  );

  const trendData = analytics?.trend ?? [];
  const metrics = analytics?.metrics;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              Culinary operations cockpit
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Strategic outlook for Karmic Canteen
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Align procurement, nutrition, and seat allocations with real-time demand
              signals gathered from employee confirmations and feedback loops.
            </p>
          </div>
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-5 text-sm text-emerald-100">
            <p>Live services scheduled</p>
            <p className="mt-1 text-3xl font-bold text-emerald-300">{upcoming.length}</p>
            <p className="text-xs text-emerald-200/80">Next 5 days</p>
          </div>
        </div>
      </section>

      {metrics && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total opt-ins"
            value={`${metrics.totalOptIns}`}
            subtitle="Confirmed employee meals"
            variant="success"
          />
          <MetricCard
            title="Opt-in rate"
            value={`${metrics.optInRate}%`}
            subtitle="Engagement over notified employees"
          />
          <MetricCard
            title="Average experience score"
            value={`${metrics.averageRating.toFixed(1)}/5`}
            subtitle="Dining satisfaction insights"
          />
          <MetricCard
            title="Waste avoided"
            value={`${metrics.wasteEstimateKg} kg`}
            subtitle="Projected reduction this week"
            variant="warning"
          />
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <PieChart className="h-5 w-5 text-emerald-300" />
            <h3 className="text-lg font-semibold text-white">Engagement trend</h3>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Monitor demand fluctuations to adjust production plans for each day.
          </p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="optIns"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="optOuts"
                  stroke="#f97316"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-emerald-300" />
            <h3 className="text-lg font-semibold text-white">Top performing menus</h3>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.topMenus ?? []}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="3 3" />
                <XAxis
                  dataKey={(entry) =>
                    `${formatDate(entry.date, "MMM d")} ${entry.mealType.toUpperCase()}`
                  }
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                  }}
                />
                <Bar dataKey="averageRating" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <MenuConfiguration
          menus={upcoming}
          onCreated={() => {
            void mutateMenus();
            void mutateAnalytics();
          }}
        />
        <InventoryManager
          items={inventory?.items ?? []}
          refresh={() => {
            void mutateInventory();
          }}
        />
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Inbox className="h-5 w-5 text-emerald-300" />
            <h3 className="text-lg font-semibold text-white">Broadcast announcements</h3>
          </div>
          <Utensils className="h-5 w-5 text-slate-400" />
        </div>
        <p className="mt-2 text-sm text-slate-300">
          Keep employees informed about seat caps, chef specials, and mindful eating nudges.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Low opt-ins alert",
              message: "Encourage confirmations for tomorrow's lunch to avoid surplus.",
              type: "warning" as const,
              scope: "employee" as const,
            },
            {
              title: "Chef spotlight",
              message: "Introduce a feature on the sourcing story behind the millet tacos.",
              type: "info" as const,
              scope: "all" as const,
            },
            {
              title: "Inventory reminder",
              message: "Procurement of fresh greens scheduled tomorrow morning.",
              type: "success" as const,
              scope: "admin" as const,
            },
          ].map((preset) => (
            <button
              type="button"
              key={preset.title}
              onClick={() => {
                void createNotification({
                  title: preset.title,
                  message: preset.message,
                  type: preset.type,
                  scope: preset.scope,
                });
              }}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-left text-sm text-emerald-100 transition hover:border-emerald-500/60 hover:bg-emerald-500/15"
            >
              <p className="font-semibold text-white">{preset.title}</p>
              <p className="mt-2 text-xs text-emerald-100/80">{preset.message}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-50 shadow-xl">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-lg font-semibold text-white">
            Smart waste guardrails & seating health
          </h3>
        </div>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            Automatic nudges trigger if opt-ins drop below 65% against capacity baseline.
          </li>
          <li>
            Seating capacity syncs with facility tools; update the cap in facility console
            for new building wings.
          </li>
          <li>
            Integrate IoT weighing scale data to audit actual waste and compare with
            projections.
          </li>
        </ul>
      </section>
    </div>
  );
};
