import { NextRequest, NextResponse } from "next/server";
import { RSVPStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cancelRsvpSchema } from "@/lib/validators";

const demoUserMap: Record<string, string> = {
  britt: "Britt Williams",
  francesca: "Francesca Hart",
  newcirclesuser: "New User",
};

function formatAttendees(
  attendees: Array<{
    user: {
      id: number;
      name: string;
      photoUrl: string | null;
    };
  }>,
  currentUserId: number
) {
  return attendees.map((rsvp) => ({
    id: rsvp.user.id,
    name: rsvp.user.name,
    photoUrl: rsvp.user.photoUrl,
    isCurrentUser: rsvp.user.id === currentUserId,
  }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = cancelRsvpSchema.safeParse(body);

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

    const existingRsvp = await prisma.eventRSVP.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id,
        },
      },
      select: {
        status: true,
      },
    });

    if (!existingRsvp) {
      return NextResponse.json(
        { error: "RSVP not found for this user and event" },
        { status: 404 }
      );
    }

    if (existingRsvp.status !== RSVPStatus.cancelled) {
      await prisma.$transaction([
        prisma.eventRSVP.update({
          where: {
            eventId_userId: {
              eventId,
              userId: user.id,
            },
          },
          data: {
            status: RSVPStatus.cancelled,
          },
        }),
        prisma.eventRSVPChange.create({
          data: {
            eventId,
            userId: user.id,
            oldStatus: existingRsvp.status,
            newStatus: RSVPStatus.cancelled,
          },
        }),
      ]);
    }

    const goingRsvps = await prisma.eventRSVP.findMany({
      where: {
        eventId,
        status: RSVPStatus.going,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      attendeeCount: goingRsvps.length,
      attendees: formatAttendees(goingRsvps, user.id),
    });
  } catch (error) {
    console.error("Error cancelling RSVP:", error);

    return NextResponse.json(
      { error: "Failed to cancel RSVP" },
      { status: 500 }
    );
  }
}