import { NextRequest, NextResponse } from "next/server";
import { RSVPStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rsvpSchema } from "@/lib/validators";
import { validateRequest } from "@/lib/validate-request";

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
    const validation = await validateRequest(request, rsvpSchema);

    if (!validation.success) {
      return validation.response;
    }

    const { user: userKey, eventId } = validation.data;

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

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
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
      await prisma.eventRSVP.create({
        data: {
          eventId,
          userId: user.id,
          status: RSVPStatus.going,
        },
      });
    } else if (existingRsvp.status !== RSVPStatus.going) {
      await prisma.$transaction([
        prisma.eventRSVP.update({
          where: {
            eventId_userId: {
              eventId,
              userId: user.id,
            },
          },
          data: {
            status: RSVPStatus.going,
          },
        }),
        prisma.eventRSVPChange.create({
          data: {
            eventId,
            userId: user.id,
            oldStatus: existingRsvp.status,
            newStatus: RSVPStatus.going,
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
    console.error("Error creating RSVP:", error);

    return NextResponse.json(
      { error: "Failed to RSVP to event" },
      { status: 500 }
    );
  }
}