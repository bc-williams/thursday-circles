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
    const userKey = searchParams.get("user");

    if (!userKey) {
      return NextResponse.json(
        { error: "Missing required parameter: user" },
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

    const events = await prisma.event.findMany({
      where: {
        isCancelled: false,
        startTime: {
          gte: new Date(),
        },
        OR: [
          {
            hostUserId: user.id,
          },
          {
            rsvps: {
              some: {
                userId: user.id,
                status: RSVPStatus.going,
              },
            },
          },
        ],
      },
      orderBy: {
        startTime: "asc",
      },
      include: {
        circle: {
          include: {
            city: {
              select: {
                slug: true,
                name: true,
              },
            },
            activity: {
              select: {
                slug: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      startTime: event.startTime.toISOString(),
      location: `${event.locationName}, ${event.circle.city.name}`,
      activitySlug: event.circle.activity.slug,
      citySlug: event.circle.city.slug,
      cityName: event.circle.city.name,
      isHostedByCurrentUser: event.hostUserId === user.id,
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("Error fetching upcoming events:", error);

    return NextResponse.json(
      { error: "Failed to fetch upcoming events" },
      { status: 500 }
    );
  }
}
