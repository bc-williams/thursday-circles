import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { joinCircleSchema } from "@/lib/validators";

const demoUserMap: Record<string, string> = {
  britt: "Britt Williams",
  francesca: "Francesca Hart",
  newcirclesuser: "New User",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = joinCircleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 }
      );
    }

    const { user: userKey, activitySlug } = parsed.data;

    const userName = demoUserMap[userKey];

    if (!userName) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { name: userName },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const activity = await prisma.activity.findUnique({
      where: { slug: activitySlug },
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    await prisma.userActivityMembership.upsert({
      where: {
        userId_activityId: {
          userId: user.id,
          activityId: activity.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        activityId: activity.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Circle joined successfully",
    });
  } catch (error) {
    console.error("Error joining circle:", error);

    return NextResponse.json(
      { error: "Failed to join circle" },
      { status: 500 }
    );
  }
}