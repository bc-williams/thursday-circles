"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ActivityPageTemplate from "@/components/activity-page-template";

const triviaData = {
  "raleigh-durham": {
    cityName: "Raleigh-Durham",
    description:
      "Team up, test your knowledge, and meet new people over drinks and friendly competition.",
  },
  london: {
    cityName: "London",
    description:
      "Pub trivia nights where teams form fast and new friendships follow.",
  },
  "new-york-city": {
    cityName: "New York City",
    description:
      "Grab a drink, join a team, and see who knows the most random facts in the room.",
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

export default function TriviaPage() {
  const searchParams = useSearchParams();
  const selectedCity = searchParams.get("city") ?? "raleigh-durham";
  const currentUser = searchParams.get("user") ?? "britt";

  const cityData =
    triviaData[selectedCity as keyof typeof triviaData] ??
    triviaData["raleigh-durham"];

  const [metrics, setMetrics] = useState<ActivityMetrics>({
    memberCount: 0,
    upcomingMeetupCount: 0,
  });

  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    async function fetchPageData() {
      try {
        const [metricsRes, eventsRes] = await Promise.all([
          fetch(`/api/activity-metrics?city=${selectedCity}&activity=trivia`),
          fetch(
            `/api/activity-events?city=${selectedCity}&activity=trivia&user=${currentUser}`
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
        console.error("Error fetching trivia page data:", error);
      }
    }

    fetchPageData();
  }, [selectedCity, currentUser]);

  return (
    <ActivityPageTemplate
      activityName="Trivia"
      activitySlug="trivia"
      selectedCity={selectedCity}
      currentUser={currentUser}
      cityData={cityData}
      memberCount={metrics.memberCount}
      upcomingMeetupCount={metrics.upcomingMeetupCount}
      events={events}
    />
  );
}