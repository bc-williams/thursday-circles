import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelEventSchema } from "@/lib/validators";

const demoUserMap: Record<string, string> = {
  britt: "Britt Williams",
  francesca: "Francesca Hart",
  newcirclesuser: "New User",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = cancelEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 }
      );
    }

    const { user: userKey, eventId } = parsed.data;

    const userName = demoUserMap[userKey];

    if (!userName) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { name: userName },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (existingEvent.hostUserId !== user.id) {
      return NextResponse.json(
        { error: "Only the host can cancel this event" },
        { status: 403 }
      );
    }

    if (existingEvent.isCancelled) {
      return NextResponse.json(
        { error: "Event is already cancelled" },
        { status: 400 }
      );
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { isCancelled: true },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error cancelling event:", error);

    return NextResponse.json(
      { error: "Failed to cancel event" },
      { status: 500 }
    );
  }
}
