import { NextRequest, NextResponse } from "next/server";
import { RSVPStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const demoUserMap: Record<string, string> = {
  britt: "Britt Williams",
  francesca: "Francesca Hart",
  newcirclesuser: "New User",
};

function firstName(fullName: string) {
  return fullName.split(" ")[0] ?? fullName;
}

function ordinalSuffix(day: number) {
  if (day >= 11 && day <= 13) return "th";

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatEventTime(date: Date) {
  const weekday = date.toLocaleDateString("en-GB", { weekday: "short" });
  const day = date.getDate();
  const month = date.toLocaleDateString("en-GB", { month: "short" });

  const time = date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();

  return `${weekday} ${day}${ordinalSuffix(day)} ${month} at ${time}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const eventIdParam = searchParams.get("eventId");
    const userKey = searchParams.get("user");

    if (!eventIdParam || !userKey) {
      return NextResponse.json(
        { error: "Missing required parameters: eventId and user" },
        { status: 400 }
      );
    }

    const parsedEventId = Number(eventIdParam);

    if (!Number.isInteger(parsedEventId) || parsedEventId <= 0) {
      return NextResponse.json({ error: "Invalid eventId" }, { status: 400 });
    }

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

    const currentUserId = user.id;

    const event = await prisma.event.findUnique({
      where: { id: parsedEventId },
      include: {
        circle: {
          include: {
            city: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            activity: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        host: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
        rsvps: {
          where: {
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
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const attendees = event.rsvps
      .map((rsvp) => ({
        id: rsvp.user.id,
        name: rsvp.user.name,
        photoUrl: rsvp.user.photoUrl,
        isCurrentUser: currentUserId === rsvp.user.id,
      }))
      .sort((a, b) => Number(b.isCurrentUser) - Number(a.isCurrentUser));

    const attendeeCount = attendees.length;
    const isUserGoing = event.rsvps.some(
      (rsvp) => rsvp.user.id === currentUserId
    );
    const isHostedByCurrentUser = event.host.id === currentUserId;

    const formattedEvent = {
      id: event.id,
      title: event.title.toUpperCase(),
      time: formatEventTime(event.startTime),
      location: `${event.locationName}, ${event.circle.city.name}`,
      hostUserId: event.host.id,
      hostName: event.host.name,
      hostPhotoUrl: event.host.photoUrl,
      isHostedByCurrentUser,
      host: isHostedByCurrentUser
        ? "Hosted by you"
        : `Hosted by ${firstName(event.host.name)}`,
      rsvps: `${attendeeCount} RSVP${attendeeCount === 1 ? "" : "s"}`,
      attendeeCount,
      isUserGoing,
      attendees,
      activitySlug: event.circle.activity.slug,
      citySlug: event.circle.city.slug,
      cityName: event.circle.city.name,
    };

    return NextResponse.json({ event: formattedEvent });
  } catch (error) {
    console.error("Error fetching event details:", error);

    return NextResponse.json(
      { error: "Failed to fetch event details" },
      { status: 500 }
    );
  }
}
