import { NextResponse } from "next/server";
import { addFeedback, getFeedbackForMenu } from "@/lib/store";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const menuId = url.searchParams.get("menuId");
  if (!menuId) {
    return NextResponse.json({ error: "menuId query param required." }, { status: 400 });
  }

  return NextResponse.json({ feedback: getFeedbackForMenu(menuId) });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { menuId, rating, comments } = body as {
      menuId?: string;
      rating?: number;
      comments?: string;
    };
    if (!menuId || typeof rating !== "number") {
      return NextResponse.json(
        { error: "menuId and rating are required." },
        { status: 400 },
      );
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5." }, { status: 400 });
    }

    const feedback = addFeedback({
      menuId,
      rating,
      userId: user.id,
      comments,
    });

    return NextResponse.json({ feedback });
  } catch {
    return NextResponse.json(
      { error: "Unable to submit feedback." },
      { status: 500 },
    );
  }
}
