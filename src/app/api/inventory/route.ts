import { NextResponse } from "next/server";
import {
  getInventory,
  removeInventoryItem,
  upsertInventoryItem,
} from "@/lib/store";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ items: getInventory() });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, name, quantity, unit, threshold, notes, action } = body as {
      id?: string;
      name?: string;
      quantity?: number;
      unit?: string;
      threshold?: number;
      notes?: string;
      action?: "delete";
    };

    if (action === "delete") {
      if (!id) {
        return NextResponse.json({ error: "Inventory ID required." }, { status: 400 });
      }
      removeInventoryItem(id);
      return NextResponse.json({ success: true });
    }

    if (!name || typeof quantity !== "number" || !unit || typeof threshold !== "number") {
      return NextResponse.json(
        { error: "Name, quantity, unit, and threshold are required." },
        { status: 400 },
      );
    }

    const item = upsertInventoryItem({
      id,
      name,
      quantity,
      unit,
      threshold,
      notes,
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json(
      { error: "Unable to update inventory." },
      { status: 500 },
    );
  }
}
