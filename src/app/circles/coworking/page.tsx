"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ActivityPageTemplate from "@/components/activity-page-template";

const coworkingData = {
  "raleigh-durham": {
    cityName: "Raleigh-Durham",
    description:
      "A low-pressure way to get out of the house, stay productive, and meet other singles between Thursday events.",
  },
  london: {
    cityName: "London",
    description:
      "An easy way to get work done somewhere social, meet new people, and turn solo productivity into a shared routine.",
  },
  "new-york-city": {
    cityName: "New York City",
    description:
      "A social productivity reset for people who want to get out, get things done, and meet someone new in the process.",
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

export default function CoworkingPage() {
  const searchParams = useSearchParams();
  const selectedCity = searchParams.get("city") ?? "raleigh-durham";
  const currentUser = searchParams.get("user") ?? "britt";

  const cityData =
    coworkingData[selectedCity as keyof typeof coworkingData] ??
    coworkingData["raleigh-durham"];

  const [metrics, setMetrics] = useState<ActivityMetrics>({
    memberCount: 0,
    upcomingMeetupCount: 0,
  });

  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    async function fetchPageData() {
      try {
        const [metricsRes, eventsRes] = await Promise.all([
          fetch(`/api/activity-metrics?city=${selectedCity}&activity=coworking`),
          fetch(
            `/api/activity-events?city=${selectedCity}&activity=coworking&user=${currentUser}`
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
        console.error("Error fetching coworking page data:", error);
      }
    }

    fetchPageData();
  }, [selectedCity, currentUser]);

  return (
    <ActivityPageTemplate
      activityName="Coworking"
      activitySlug="coworking"
      selectedCity={selectedCity}
      currentUser={currentUser}
      cityData={cityData}
      memberCount={metrics.memberCount}
      upcomingMeetupCount={metrics.upcomingMeetupCount}
      events={events}
    />
  );
}