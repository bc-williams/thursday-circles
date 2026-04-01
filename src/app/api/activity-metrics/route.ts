import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const citySlug = searchParams.get("city");
    const activitySlug = searchParams.get("activity");

    if (!citySlug || !activitySlug) {
      return NextResponse.json(
        { error: "Missing required parameters: city and activity" },
        { status: 400 }
      );
    }

    // Find the city
    const city = await prisma.city.findUnique({
      where: { slug: citySlug },
      select: { id: true, name: true },
    });

    // Find the activity
    const activity = await prisma.activity.findUnique({
      where: { slug: activitySlug },
      select: { id: true, name: true },
    });

    if (!city || !activity) {
      return NextResponse.json(
        { error: "City or activity not found" },
        { status: 404 }
      );
    }

    // Count local members of this activity
    const memberCount = await prisma.user.count({
      where: {
        homeCityId: city.id,
        memberships: {
          some: {
            activityId: activity.id,
          },
        },
      },
    });

    // Count upcoming events for this circle
    const upcomingMeetupCount = await prisma.event.count({
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
    });

    return NextResponse.json({
      city: city.name,
      activity: activity.name,
      memberCount,
      upcomingMeetupCount,
    });
  } catch (error) {
    console.error("Error fetching activity metrics:", error);

    return NextResponse.json(
      { error: "Failed to fetch activity metrics" },
      { status: 500 }
    );
  }
}