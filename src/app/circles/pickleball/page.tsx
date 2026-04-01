"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ActivityPageTemplate from "@/components/activity-page-template";

const pickleballData = {
  "raleigh-durham": {
    cityName: "Raleigh-Durham",
    description:
      "Casual games, social energy, and a reason to keep the momentum going between Thursday events.",
  },
  london: {
    cityName: "London",
    description:
      "A social way to stay active, meet new people, and turn a quick game into an easy hang.",
  },
  "new-york-city": {
    cityName: "New York City",
    description:
      "Quick games, strong turnout, and a built-in excuse to keep meeting people after the first event.",
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

export default function PickleballPage() {
  const searchParams = useSearchParams();
  const selectedCity = searchParams.get("city") ?? "raleigh-durham";
  const currentUser = searchParams.get("user") ?? "britt";

  const cityData =
    pickleballData[selectedCity as keyof typeof pickleballData] ??
    pickleballData["raleigh-durham"];

  const [metrics, setMetrics] = useState<ActivityMetrics>({
    memberCount: 0,
    upcomingMeetupCount: 0,
  });

  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    async function fetchPageData() {
      try {
        const [metricsRes, eventsRes] = await Promise.all([
          fetch(`/api/activity-metrics?city=${selectedCity}&activity=pickleball`),
          fetch(
            `/api/activity-events?city=${selectedCity}&activity=pickleball&user=${currentUser}`
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
        console.error("Error fetching pickleball page data:", error);
      }
    }

    fetchPageData();
  }, [selectedCity, currentUser]);

  return (
    <ActivityPageTemplate
      activityName="Pickleball"
      activitySlug="pickleball"
      selectedCity={selectedCity}
      currentUser={currentUser}
      cityData={cityData}
      memberCount={metrics.memberCount}
      upcomingMeetupCount={metrics.upcomingMeetupCount}
      events={events}
    />
  );
}