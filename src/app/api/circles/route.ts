import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const demoUserMap: Record<string, string> = {
  britt: "Britt Williams",
  francesca: "Francesca Hart",
  newcirclesuser: "New User",
};

export async function GET(request: NextRequest) {
  try {
    const citySlug = request.nextUrl.searchParams.get("city");
    const userKey = request.nextUrl.searchParams.get("user");

    if (!citySlug) {
      return NextResponse.json(
        { error: "Missing city query parameter" },
        { status: 400 }
      );
    }

    let joinedActivityIds: number[] | null = null;

    if (userKey) {
      const userName = demoUserMap[userKey];

      if (!userName) {
        return NextResponse.json(
          { error: "Invalid user query parameter" },
          { status: 400 }
        );
      }

      const user = await prisma.user.findFirst({
        where: { name: userName },
        include: {
          memberships: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      joinedActivityIds = user.memberships.map(
        (membership) => membership.activityId
      );
    }

    const circles = await prisma.circle.findMany({
      where: {
        city: {
          slug: citySlug,
        },
        ...(joinedActivityIds !== null
          ? {
              activityId: {
                in: joinedActivityIds,
              },
            }
          : {}),
      },
      include: {
        activity: true,
        city: true,
        events: {
          where: {
            startTime: {
              gte: new Date(),
            },
          },
        },
      },
      orderBy: {
        activity: {
          name: "asc",
        },
      },
    });

    const formattedCircles = circles.map((circle) => ({
      id: circle.id,
      city: circle.city.name,
      citySlug: circle.city.slug,
      activity: circle.activity.name,
      activitySlug: circle.activity.slug,
      iconPath: circle.activity.iconPath,
      memberCount: 0,
      upcomingMeetups: circle.events.length,
    }));

    return NextResponse.json(formattedCircles);
  } catch (error) {
    console.error("Error fetching circles:", error);
    return NextResponse.json(
      { error: "Failed to fetch circles" },
      { status: 500 }
    );
  }
}