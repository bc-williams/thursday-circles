"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ActivityPageTemplate from "@/components/activity-page-template";

const boardGameData = {
  "raleigh-durham": {
    cityName: "Raleigh-Durham",
    description:
      "Low-pressure game nights where you can meet people while playing something fun. No awkward small talk required.",
  },
  london: {
    cityName: "London",
    description:
      "Meet people while playing something fun — from casual party games to strategic classics.",
  },
  "new-york-city": {
    cityName: "New York City",
    description:
      "A relaxed way to meet people while playing something fun — from quick party games to deeper strategy nights.",
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

export default function BoardGamesPage() {
  const searchParams = useSearchParams();
  const selectedCity = searchParams.get("city") ?? "raleigh-durham";
  const currentUser = searchParams.get("user") ?? "britt";

  const cityData =
    boardGameData[selectedCity as keyof typeof boardGameData] ??
    boardGameData["raleigh-durham"];

  const [metrics, setMetrics] = useState<ActivityMetrics>({
    memberCount: 0,
    upcomingMeetupCount: 0,
  });

  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    async function fetchPageData() {
      try {
        const [metricsRes, eventsRes] = await Promise.all([
          fetch(`/api/activity-metrics?city=${selectedCity}&activity=boardgames`),
          fetch(
            `/api/activity-events?city=${selectedCity}&activity=boardgames&user=${currentUser}`
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
        console.error("Error fetching board games page data:", error);
      }
    }

    fetchPageData();
  }, [selectedCity, currentUser]);

  return (
    <ActivityPageTemplate
      activityName="Board Games"
      activitySlug="boardgames"
      selectedCity={selectedCity}
      currentUser={currentUser}
      cityData={cityData}
      memberCount={metrics.memberCount}
      upcomingMeetupCount={metrics.upcomingMeetupCount}
      events={events}
    />
  );
}