import { NextResponse } from "next/server";
import {
  addNotification,
  getNotifications,
  markNotificationAsRead,
} from "@/lib/store";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") ?? undefined;
  const notifications = getNotifications(
    scope === "admin" || scope === "employee" || scope === "all" ? scope : undefined,
  );
  return NextResponse.json({ notifications });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { action } = body as { action?: "read" | "create" };

  if (action === "read") {
    const { notificationId } = body as { notificationId?: string };
    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId required." },
        { status: 400 },
      );
    }
    markNotificationAsRead({ notificationId, userId: user.id });
    return NextResponse.json({ success: true });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, message, type, scope } = body as {
    title?: string;
    message?: string;
    type?: "info" | "warning" | "success";
    scope?: "employee" | "admin" | "all";
  };

  if (!title || !message || !type || !scope) {
    return NextResponse.json(
      { error: "title, message, type, and scope are required." },
      { status: 400 },
    );
  }

  const notification = addNotification({
    title,
    message,
    type,
    scope,
  });
  return NextResponse.json({ notification });
}
