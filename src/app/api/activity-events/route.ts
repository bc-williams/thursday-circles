import { NextRequest, NextResponse } from "next/server";
import { RSVPStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const demoUserMap: Record<string, string> = {
  britt: "Britt Williams",
  francesca: "Francesca Hart",
  newcirclesuser: "New User",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const citySlug = searchParams.get("city");
    const activitySlug = searchParams.get("activity");
    const userKey = searchParams.get("user");

    if (!citySlug || !activitySlug || !userKey) {
      return NextResponse.json(
        { error: "Missing required parameters: city, activity, and user" },
        { status: 400 }
      );
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

    const city = await prisma.city.findUnique({
      where: { slug: citySlug },
      select: { id: true },
    });

    const activity = await prisma.activity.findUnique({
      where: { slug: activitySlug },
      select: { id: true },
    });

    if (!city || !activity) {
      return NextResponse.json(
        { error: "City or activity not found" },
        { status: 404 }
      );
    }

    const events = await prisma.event.findMany({
      where: {
        isCancelled: false,
        circle: {
          cityId: city.id,
          activityId: activity.id,
        },
        startTime: {
          gte: new Date(),
        },
      },
      orderBy: {
        startTime: "asc",
      },
      include: {
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

    const formattedEvents = events.map((event) => {
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

      return {
        id: event.id,
        title: event.title.toUpperCase(),
        time: formatEventTime(event.startTime),
        location: event.locationName,
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
      };
    });

    return NextResponse.json({
      events: formattedEvents,
    });
  } catch (error) {
    console.error("Error fetching activity events:", error);

    return NextResponse.json(
      { error: "Failed to fetch activity events" },
      { status: 500 }
    );
  }
}

function firstName(fullName: string) {
  return fullName.split(" ")[0] ?? fullName;
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