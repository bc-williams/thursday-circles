"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ActivityPageTemplate from "@/components/activity-page-template";

const volunteeringData = {
  "raleigh-durham": {
    cityName: "Raleigh-Durham",
    description:
      "Meet people who care about the same things you do while giving back to the community.",
  },
  london: {
    cityName: "London",
    description:
      "A meaningful way to meet people while giving your time to causes and organizations around the city.",
  },
  "new-york-city": {
    cityName: "New York City",
    description:
      "Give back, meet thoughtful people, and turn community service into a social ritual.",
  },
} as const;

type ActivityMetrics = {
  memberCount: number;
  upcomingMeetupCount: number;
};

type ActivityEvent = {
  id: number;
  title: string;
  time: string;
  location: string;
  host: string;
  rsvps: string;
  attendeeCount?: number;
  isUserGoing?: boolean;
  attendees?: {
    id: number;
    name: string;
    photoUrl?: string | null;
    isCurrentUser?: boolean;
  }[];
};

export default function VolunteeringPage() {
  const searchParams = useSearchParams();
  const selectedCity = searchParams.get("city") ?? "raleigh-durham";
  const currentUser = searchParams.get("user") ?? "britt";

  const cityData =
    volunteeringData[selectedCity as keyof typeof volunteeringData] ??
    volunteeringData["raleigh-durham"];

  const [metrics, setMetrics] = useState<ActivityMetrics>({
    memberCount: 0,
    upcomingMeetupCount: 0,
  });

  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    async function fetchPageData() {
      try {
        const [metricsRes, eventsRes] = await Promise.all([
          fetch(`/api/activity-metrics?city=${selectedCity}&activity=volunteering`),
          fetch(
            `/api/activity-events?city=${selectedCity}&activity=volunteering&user=${currentUser}`
          ),
        ]);

        if (!metricsRes.ok) {
          throw new Error("Failed to fetch activity metrics");
        }

        if (!eventsRes.ok) {
          throw new Error("Failed to fetch activity events");
        }

        const metricsData = await metricsRes.json();
        const eventsData = await eventsRes.json();

        setMetrics({
          memberCount: metricsData.memberCount,
          upcomingMeetupCount: metricsData.upcomingMeetupCount,
        });

        setEvents(eventsData.events ?? []);
      } catch (error) {
        console.error("Error fetching volunteering page data:", error);
      }
    }

    fetchPageData();
  }, [selectedCity, currentUser]);

  return (
    <ActivityPageTemplate
      activityName="Volunteering"
      activitySlug="volunteering"
      selectedCity={selectedCity}
      currentUser={currentUser}
      cityData={cityData}
      memberCount={metrics.memberCount}
      upcomingMeetupCount={metrics.upcomingMeetupCount}
      events={events}
    />
  );
}