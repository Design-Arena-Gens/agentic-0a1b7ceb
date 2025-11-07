import { NextResponse } from "next/server";
import { deleteMenu, getMenuById, upsertMenu } from "@/lib/store";
import { getSessionUser } from "@/lib/auth";
import type { Menu } from "@/lib/types";

const isValidMealType = (value: unknown): value is Menu["mealType"] =>
  value === "breakfast" || value === "lunch" || value === "snacks";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const existing = getMenuById(id);
    if (!existing) {
      return NextResponse.json({ error: "Menu not found." }, { status: 404 });
    }

    const body = (await request.json()) as Partial<Menu>;
    if (body.mealType && !isValidMealType(body.mealType)) {
      return NextResponse.json({ error: "Invalid meal type." }, { status: 400 });
    }

    const updated = upsertMenu({
      ...existing,
      ...body,
      id,
      dishes: body.dishes || existing.dishes,
      nutritionalInfo: body.nutritionalInfo || existing.nutritionalInfo,
      mealType: (body.mealType || existing.mealType) as Menu["mealType"],
    });

    return NextResponse.json({ menu: updated });
  } catch {
    return NextResponse.json(
      { error: "Unable to update menu." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const existing = getMenuById(id);
  if (!existing) {
    return NextResponse.json({ error: "Menu not found." }, { status: 404 });
  }

  deleteMenu(id);
  return NextResponse.json({ success: true });
}
