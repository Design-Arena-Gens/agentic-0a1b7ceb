import { NextResponse } from "next/server";
import {
  getMenus,
  getSelections,
  getSelectionsForUser,
  upsertSelection,
  getMenuById,
  getSeatingCapacity,
} from "@/lib/store";
import { getSessionUser } from "@/lib/auth";
import type { MealSelection } from "@/lib/types";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const aggregate = url.searchParams.get("aggregate") === "true";

  if (aggregate) {
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const selections = getSelections();
    const menus = getMenus({ includePast: true });

    const aggregated = menus.map((menu) => {
      const entries = selections.filter((selection) => selection.menuId === menu.id);
      const optInCount = entries.filter((entry) => entry.status === "opt-in").length;
      const optOutCount = entries.length - optInCount;
      const capacity = getSeatingCapacity(menu.date)?.capacity ?? null;
      return {
        menu,
        optInCount,
        optOutCount,
        pendingCount: Math.max(capacity ? capacity - optInCount : 0, 0),
        capacity,
      };
    });

    return NextResponse.json({ selections: aggregated });
  }

  return NextResponse.json({
    selections: getSelectionsForUser(user.id),
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<MealSelection> & {
      menuId?: string;
      status?: MealSelection["status"];
      reason?: string;
    };

    if (!body.menuId || !body.status) {
      return NextResponse.json(
        { error: "Menu ID and status are required." },
        { status: 400 },
      );
    }
    if (body.status !== "opt-in" && body.status !== "opt-out") {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    const menu = getMenuById(body.menuId);
    if (!menu) {
      return NextResponse.json({ error: "Menu not found." }, { status: 404 });
    }

    const selection = upsertSelection({
      menuId: body.menuId,
      status: body.status,
      userId: user.id,
      reason: body.reason,
    });

    return NextResponse.json({ selection });
  } catch {
    return NextResponse.json(
      { error: "Unable to update meal selection." },
      { status: 500 },
    );
  }
}
