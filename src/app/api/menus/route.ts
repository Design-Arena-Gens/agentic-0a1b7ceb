import { NextResponse } from "next/server";
import {
  getMenus,
  upsertMenu,
  getSelectionsForMenu,
  getFeedbackForMenu,
} from "@/lib/store";
import type { Menu } from "@/lib/types";
import { getSessionUser } from "@/lib/auth";

const isValidMealType = (value: unknown): value is Menu["mealType"] =>
  value === "breakfast" || value === "lunch" || value === "snacks";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includePast = url.searchParams.get("includePast") === "true";
  const date = url.searchParams.get("date");
  const mealType = url.searchParams.get("mealType");

  let menus = getMenus({ includePast });
  if (date) {
    menus = menus.filter((menu) => menu.date.startsWith(date));
  }
  if (mealType && isValidMealType(mealType)) {
    menus = menus.filter((menu) => menu.mealType === mealType);
  }

  const enriched = menus.map((menu) => {
    const selections = getSelectionsForMenu(menu.id);
    const feedback = getFeedbackForMenu(menu.id);
    return {
      ...menu,
      stats: {
        optIns: selections.filter((item) => item.status === "opt-in").length,
        optOuts: selections.filter((item) => item.status === "opt-out").length,
        feedbackCount: feedback.length,
        averageRating:
          feedback.length === 0
            ? 0
            : Number(
                (
                  feedback.reduce((acc, item) => acc + item.rating, 0) /
                  feedback.length
                ).toFixed(1),
              ),
      },
    };
  });

  return NextResponse.json({ menus: enriched });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Partial<Menu>;
    if (!body.date || !isValidMealType(body.mealType)) {
      return NextResponse.json(
        { error: "Invalid menu payload." },
        { status: 400 },
      );
    }
    if (!Array.isArray(body.dishes) || body.dishes.length === 0) {
      return NextResponse.json(
        { error: "At least one dish is required." },
        { status: 400 },
      );
    }
    if (!body.nutritionalInfo) {
      return NextResponse.json(
        { error: "Nutritional information is required." },
        { status: 400 },
      );
    }

    const menu = upsertMenu({
      date: body.date,
      mealType: body.mealType,
      dishes: body.dishes,
      nutritionalInfo: body.nutritionalInfo,
      specialNotes: body.specialNotes,
    });

    return NextResponse.json({ menu });
  } catch {
    return NextResponse.json(
      { error: "Failed to create menu." },
      { status: 500 },
    );
  }
}
