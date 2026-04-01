"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { archivo, barlowBlack, bebas } from "@/lib/fonts";
import { activityIcons } from "@/lib/activity-icons";
import Link from "next/link";
import { cityOptions } from "@/lib/cities";
import CustomDropdown from "@/components/custom-dropdown";
import EventDetailModal, {
  type EventModalEvent,
} from "@/components/event-detail-modal";

type Circle = {
  id: number;
  city: string;
  citySlug: string;
  activity: string;
  activitySlug: string;
  iconPath: string | null;
  memberCount: number;
  upcomingMeetups: number;
};

type UpcomingEvent = {
  id: number;
  title: string;
  startTime: string;
  location: string;
  activitySlug: string;
  citySlug: string;
  cityName: string;
  isHostedByCurrentUser?: boolean;
};

const CIRCLES_CACHE_KEY = "circles-cache";

const cityDropdownOptions = cityOptions.map((city) => ({
  value: city.slug,
  label: city.name,
}));

export default function CirclesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCity = searchParams.get("city") ?? "raleigh-durham";
  const currentUser = searchParams.get("user") ?? "britt";

  const [selectedCity, setSelectedCity] = useState(urlCity);
  const [circlesCache, setCirclesCache] = useState<Record<string, Circle[]>>({});
  const [circles, setCircles] = useState<Circle[]>([]);
  const [joinedCircles, setJoinedCircles] = useState<Circle[]>([]);
  const [allCircles, setAllCircles] = useState<Circle[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isNewToCirclesView, setIsNewToCirclesView] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedActivitySlugs, setSelectedActivitySlugs] = useState<string[]>([]);
  const [submittingSelections, setSubmittingSelections] = useState(false);
  const [showAllUpcomingEvents, setShowAllUpcomingEvents] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    function handleScroll() {
      if (!el) return;
      setIsOverflowing(el.scrollHeight > el.clientHeight);
      setIsScrolledToBottom(
        Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight - 10
      );
    }

    handleScroll();

    el.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    const observer = new MutationObserver(handleScroll);
    observer.observe(el, { childList: true, subtree: true, attributes: true });

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      observer.disconnect();
    };
  }, [showAllUpcomingEvents, upcomingEvents]);

  const [selectedEvent, setSelectedEvent] = useState<EventModalEvent | null>(null);
  const [isEventModalLoading, setIsEventModalLoading] = useState(false);
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [isCancellingRsvp, setIsCancellingRsvp] = useState(false);
  const [isCancellingEvent, setIsCancellingEvent] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [exploreError, setExploreError] = useState<string | null>(null);

  const joinedCacheKey = `${currentUser}:${selectedCity}:joined`;
  const allCacheKey = `${selectedCity}:all`;

  useEffect(() => {
    setSelectedCity(urlCity);
  }, [urlCity]);

  useEffect(() => {
    const saved = sessionStorage.getItem(CIRCLES_CACHE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    setCirclesCache(parsed);
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    sessionStorage.setItem(CIRCLES_CACHE_KEY, JSON.stringify(circlesCache));
  }, [circlesCache, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;

    async function fetchCircles() {
      const cachedJoinedCircles = circlesCache[joinedCacheKey] as
        | Circle[]
        | undefined;
      const cachedAllCircles = circlesCache[allCacheKey] as Circle[] | undefined;

      const hasCachedData =
        (cachedJoinedCircles && cachedJoinedCircles.length > 0) ||
        (cachedAllCircles && cachedAllCircles.length > 0);

      setLoading(!hasCachedData);

      try {
        if (cachedJoinedCircles) {
          setJoinedCircles(cachedJoinedCircles);
          setSelectedActivitySlugs(
            cachedJoinedCircles.map((circle) => circle.activitySlug)
          );

          if (cachedJoinedCircles.length > 0) {
            setCircles(cachedJoinedCircles);
            setIsNewToCirclesView(false);
            setSelectionMode(false);
          }
        }

        if (cachedAllCircles) {
          setAllCircles(cachedAllCircles);

          if (!cachedJoinedCircles || cachedJoinedCircles.length === 0) {
            setCircles(cachedAllCircles);
            setIsNewToCirclesView(true);
            setSelectionMode(true);
            setSelectedActivitySlugs([]);
          }
        }

        const [joinedRes, allRes] = await Promise.all([
          fetch(`/api/circles?city=${selectedCity}&user=${currentUser}`),
          fetch(`/api/circles?city=${selectedCity}`),
        ]);

        if (!joinedRes.ok) {
          throw new Error("Failed to fetch user circles");
        }

        if (!allRes.ok) {
          throw new Error("Failed to fetch all circles");
        }

        const joinedData: Circle[] = await joinedRes.json();
        const allData: Circle[] = await allRes.json();

        setJoinedCircles(joinedData);
        setAllCircles(allData);

        if (joinedData.length > 0) {
          setCircles(joinedData);
          setIsNewToCirclesView(false);
          setSelectionMode(false);
          setSelectedActivitySlugs(
            joinedData.map((circle) => circle.activitySlug)
          );
        } else {
          setCircles(allData);
          setIsNewToCirclesView(true);
          setSelectionMode(true);
          setSelectedActivitySlugs([]);
        }

        setCirclesCache((prev) => ({
          ...prev,
          [joinedCacheKey]: joinedData,
          [allCacheKey]: allData,
        }));
      } catch (error) {
        console.error("Error fetching circles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCircles();

    // circlesCache is intentionally omitted here:
    // we want to read from the hydrated cache for immediate paint,
    // but avoid re-fetching every time cache is updated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity, currentUser, joinedCacheKey, allCacheKey, hasHydrated]);

  useEffect(() => {
    async function fetchUpcomingEvents() {
      setEventsLoading(true);

      try {
        const res = await fetch(`/api/upcoming-events?user=${currentUser}`);

        if (!res.ok) {
          throw new Error("Failed to fetch upcoming events");
        }

        const data: UpcomingEvent[] = await res.json();
        setUpcomingEvents(data);
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
        setUpcomingEvents([]);
      } finally {
        setEventsLoading(false);
      }
    }

    fetchUpcomingEvents();
  }, [currentUser]);

  const selectedCityName =
    cityOptions.find((city) => city.slug === selectedCity)?.name ??
    "Raleigh-Durham";

  const displayCircles = useMemo(() => {
    if (selectionMode) {
      return allCircles;
    }
    return circles;
  }, [selectionMode, allCircles, circles]);

  const headingText =
    isNewToCirclesView || selectionMode
      ? "Thursday Circles"
      : "Your Thursday Circles";

  const bodyText = isNewToCirclesView
    ? "Thursday Circles helps you meet people through shared interests, not just one-off events. Join a circle, find people in a similar phase of life, and keep the momentum going between Thursday nights."
    : selectionMode
      ? "Add more circles that fit your life right now. Tap the ones that feel like you, then lock them in."
      : "Jump back into the communities you’ve joined, see what’s coming up next, and keep the momentum going between Thursday events.";

  const cardTitle = isNewToCirclesView
    ? "Why Circles?"
    : "Tap to Join a Circle";

  const cardBody = isNewToCirclesView
    ? "Your friends are not always in the same season as you. Circles gives singles an easy way to do things they already want to do while meeting like-minded people along the way."
    : "Gray circles are not selected yet. Tap a circle to add it, tap again to remove it, then explore your community.";

  function toggleCircle(activitySlug: string) {
    setSelectedActivitySlugs((prev) =>
      prev.includes(activitySlug)
        ? prev.filter((slug) => slug !== activitySlug)
        : [...prev, activitySlug]
    );
  }

  async function handleExploreCommunity() {
    if (selectedActivitySlugs.length === 0) return;

    try {
      setExploreError(null);
      setSubmittingSelections(true);

      const joinPromises = selectedActivitySlugs.map((activitySlug) =>
        fetch("/api/join-circle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: currentUser,
            activitySlug,
          }),
        })
      );

      const responses = await Promise.all(joinPromises);

      const failed = responses.some((res) => !res.ok);
      if (failed) {
        throw new Error("Failed to join one or more circles");
      }

      const selectedCircles = allCircles.filter((circle) =>
        selectedActivitySlugs.includes(circle.activitySlug)
      );

      setJoinedCircles(selectedCircles);
      setCircles(selectedCircles);
      setIsNewToCirclesView(false);
      setSelectionMode(false);

      const updatedCache = {
        ...circlesCache,
        [joinedCacheKey]: selectedCircles,
        [allCacheKey]: allCircles,
      };

      setCirclesCache(updatedCache);
      sessionStorage.setItem(CIRCLES_CACHE_KEY, JSON.stringify(updatedCache));
    } catch (error) {
      console.error("Error joining selected circles:", error);
      setExploreError(
        error instanceof Error
          ? error.message
          : "Failed to join one or more circles."
      );
    } finally {
      setSubmittingSelections(false);
    }
  }

  function handleAddMoreCircles() {
    const existingJoinedSlugs = joinedCircles.map((circle) => circle.activitySlug);
    setSelectedActivitySlugs(existingJoinedSlugs);
    setSelectionMode(true);
  }

  async function openUpcomingEventModal(eventId: number) {
    try {
      setActionError(null);
      setIsEventModalLoading(true);

      const res = await fetch(
        `/api/event-details?eventId=${eventId}&user=${currentUser}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch event details");
      }

      const data = await res.json();

      if (!data?.event) {
        throw new Error("No event returned");
      }

      setSelectedEvent(data.event);
    } catch (error) {
      console.error("Error opening upcoming event modal:", error);
    } finally {
      setIsEventModalLoading(false);
    }
  }

  function closeEventModal() {
    setSelectedEvent(null);
    setActionError(null);
  }

  async function handleRsvp(eventId: number) {
    try {
      setActionError(null);
      setIsSubmittingRsvp(true);

      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: currentUser,
          eventId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to RSVP");
      }

      const data = await res.json();

      setSelectedEvent((prev) =>
        prev && prev.id === eventId
          ? {
              ...prev,
              isUserGoing: true,
              attendeeCount: data.attendeeCount,
              rsvps: `${data.attendeeCount} RSVP${data.attendeeCount === 1 ? "" : "s"}`,
              attendees: data.attendees,
            }
          : prev
      );
    } catch (error) {
      console.error("Error RSVPing to event:", error);
      setActionError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setIsSubmittingRsvp(false);
    }
  }

  async function handleCancelRsvp(eventId: number) {
    try {
      setActionError(null);
      setIsCancellingRsvp(true);

      const res = await fetch("/api/cancel-rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: currentUser,
          eventId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to cancel RSVP");
      }

      const data = await res.json();

      setSelectedEvent((prev) =>
        prev && prev.id === eventId
          ? {
              ...prev,
              isUserGoing: false,
              attendeeCount: data.attendeeCount,
              rsvps: `${data.attendeeCount} RSVP${data.attendeeCount === 1 ? "" : "s"}`,
              attendees: data.attendees,
            }
          : prev
      );

      setUpcomingEvents((prev) => prev.filter((event) => event.id !== eventId));

      setSelectedEvent((prev) => (prev?.isHostedByCurrentUser ? prev : null));
    } catch (error) {
      console.error("Error cancelling RSVP:", error);
      setActionError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setIsCancellingRsvp(false);
    }
  }

  async function handleCancelEvent(eventId: number) {
    try {
      setActionError(null);
      setIsCancellingEvent(true);

      const res = await fetch("/api/cancel-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: currentUser,
          eventId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to cancel event");
      }

      setUpcomingEvents((prev) => prev.filter((event) => event.id !== eventId));
      closeEventModal();
    } catch (error) {
      console.error("Error cancelling event:", error);
      setActionError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setIsCancellingEvent(false);
    }
  }

  function formatEventDateTime(startTime: string) {
    return new Date(startTime).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const visibleUpcomingEvents = showAllUpcomingEvents
    ? upcomingEvents
    : upcomingEvents.slice(0, 2);

  const shouldShowPeek =
    (!showAllUpcomingEvents && upcomingEvents.length > 1) ||
    (showAllUpcomingEvents && isOverflowing && !isScrolledToBottom);

  return (
    <>
      <main className="min-h-screen bg-black flex justify-center">
        <div className="w-full max-w-md px-6 pt-6 pb-24 text-white">
          <div className="mb-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <Link
                href="/"
                className="text-sm uppercase tracking-[0.2em] text-white/60 hover:text-white transition"
              >
                Thursday
              </Link>

              <div className="relative -mt-1 shrink-0">
                <CustomDropdown
                  value={selectedCity}
                  options={cityDropdownOptions}
                  ariaLabel="Select city"
                  onChange={(value) => {
                    setSelectedCity(value);
                    router.replace(`/circles?user=${currentUser}&city=${value}`);
                  }}
                  buttonClassName={`${bebas.className} min-w-[140px] bg-transparent px-1 text-right text-xl uppercase text-white`}
                  menuClassName="w-[180px]"
                  optionClassName={`${bebas.className} text-lg uppercase`}
                />
              </div>
            </div>

            <h1 className={`${barlowBlack.className} text-5xl uppercase leading-[0.9]`}>
              {headingText}
            </h1>

            <p className={`${archivo.className} mt-4 text-base leading-7 text-white/75`}>
              {bodyText}
            </p>
          </div>

          {!selectionMode && (
            <section className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <h2
                  className={`${bebas.className} text-3xl uppercase tracking-wide text-white`}
                >
                  Your Upcoming Events
                </h2>

                {!eventsLoading && upcomingEvents.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setShowAllUpcomingEvents((prev) => !prev)}
                    className={`${archivo.className} text-xs uppercase tracking-[0.16em] text-[#EFAFD0] transition hover:text-white`}
                  >
                    {showAllUpcomingEvents ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>

              {eventsLoading ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className={`${archivo.className} text-sm leading-6 text-white/60`}>
                    Loading your events...
                  </p>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className={`${archivo.className} text-sm leading-6 text-white/70`}>
                    You haven’t joined any events yet — once you RSVP to
                    something, it’ll show up here.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div
                    ref={scrollContainerRef}
                    className={`custom-scrollbar space-y-3 overflow-y-auto overflow-x-hidden transition-all duration-300 ${
                      showAllUpcomingEvents ? "max-h-[1200px]" : "max-h-[205px]"
                    }`}
                  >
                    {visibleUpcomingEvents.map((event, index) => {
                      const isPeekCard = !showAllUpcomingEvents && index === 1;

                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => {
                            if (isPeekCard) return;
                            openUpcomingEventModal(event.id);
                          }}
                          className={`block w-full rounded-3xl border p-4 text-left transition hover:opacity-90 ${
                            event.isHostedByCurrentUser
                              ? "border-[#EFAFD0]/60 bg-[#F7D3E7] text-black"
                              : "border-white/10 bg-white/5 text-white"
                          } ${isPeekCard ? "pointer-events-none opacity-65" : ""}`}
                        >
                          <div className={`${isPeekCard ? "max-h-8 overflow-hidden" : ""}`}>
                            <div className="mb-1 flex items-start justify-between gap-3">
                              <h3
                                className={`${bebas.className} text-2xl uppercase tracking-wide leading-none`}
                              >
                                {event.title}
                              </h3>

                              {event.isHostedByCurrentUser ? (
                                <span
                                  className={`${archivo.className} inline-flex items-center rounded-full bg-black/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]`}
                                >
                                  Hosting
                                </span>
                              ) : (
                                <span
                                  className={`${archivo.className} inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/85`}
                                >
                                  Going
                                  <span aria-hidden="true">✓</span>
                                </span>
                              )}
                            </div>

                            <p
                              className={`${archivo.className} text-sm ${
                                event.isHostedByCurrentUser
                                  ? "text-black/75"
                                  : "text-white/65"
                              }`}
                            >
                              {formatEventDateTime(event.startTime)}
                            </p>

                            <p
                              className={`${archivo.className} mt-1 text-sm ${
                                event.isHostedByCurrentUser
                                  ? "text-black/75"
                                  : "text-white/65"
                              }`}
                            >
                              {event.location}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {shouldShowPeek && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-gradient-to-t from-black via-black/85 to-transparent" />
                  )}
                </div>
              )}
            </section>
          )}

          {(isNewToCirclesView || selectionMode) && (
            <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className={`${bebas.className} text-2xl uppercase tracking-wide text-white`}>
                {cardTitle}
              </p>
              <p className={`${archivo.className} mt-2 text-sm leading-6 text-white/70`}>
                {cardBody}
              </p>
            </div>
          )}

          {!selectionMode && (
            <div className="mb-6">
              <h2 className={`${bebas.className} text-3xl uppercase tracking-wide text-white`}>
                {`What’s Happening in ${selectedCityName}`}
              </h2>
            </div>
          )}

          {selectionMode && (
            <p
              className={`${archivo.className} mb-6 text-center text-sm leading-6 text-white/60`}
            >
              Tap the circles you’re interested in joining, then tap{" "}
              <span className="text-white">Explore My Community</span> when
              you’re done.
            </p>
          )}

          {loading && displayCircles.length === 0 ? (
            <p className="text-white/60">Loading circles...</p>
          ) : (
            <>
              <div
                className={`grid grid-cols-3 gap-x-6 gap-y-8 transition-opacity duration-200 ${
                  loading ? "opacity-60" : "opacity-100"
                }`}
              >
                {displayCircles.map((circle) => {
                  const isSelected = selectedActivitySlugs.includes(circle.activitySlug);
                  const isInteractiveSelection = selectionMode;

                  return (
                    <button
                      key={circle.id}
                      type="button"
                      onClick={() => {
                        if (isInteractiveSelection) {
                          toggleCircle(circle.activitySlug);
                          return;
                        }

                        router.push(
                          `/circles/${circle.activitySlug}?city=${circle.citySlug}&user=${currentUser}`
                        );
                      }}
                      className="flex flex-col items-center text-center transition cursor-pointer hover:opacity-90"
                    >
                      <div
                        className={`flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition-all ${
                          isInteractiveSelection
                            ? isSelected
                              ? "bg-[#F7D3E7]"
                              : "bg-white/40"
                            : "bg-[#F7D3E7]"
                        }`}
                      >
                        <Image
                          src={
                            activityIcons[circle.activitySlug] ||
                            "/icons/pickleball-icon.png"
                          }
                          alt={circle.activity}
                          width={54}
                          height={54}
                          className={`h-[54px] w-[54px] object-contain transition-opacity ${
                            isInteractiveSelection && !isSelected
                              ? "opacity-70"
                              : "opacity-100"
                          }`}
                        />
                      </div>

                      <span
                        className={`${bebas.className} mt-3 text-2xl uppercase tracking-wide ${
                          isInteractiveSelection && !isSelected
                            ? "text-white/40"
                            : "text-white"
                        }`}
                      >
                        {circle.activity}
                      </span>

                      <span
                        className={`mt-1 text-xs ${
                          isInteractiveSelection && !isSelected
                            ? "text-white/35"
                            : "text-white/50"
                        }`}
                      >
                        {circle.upcomingMeetups} meetup
                        {circle.upcomingMeetups === 1 ? "" : "s"}
                      </span>
                    </button>
                  );
                })}

                {!isNewToCirclesView && !selectionMode && (
                  <button
                    type="button"
                    onClick={handleAddMoreCircles}
                    className="flex flex-col items-center text-center transition cursor-pointer hover:opacity-90"
                  >
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#EFAFD0] bg-black px-2 text-center shadow-lg transition-all">
                      <span
                        className={`${bebas.className} text-[1rem] leading-[0.9] tracking-wide text-[#F7D3E7]`}
                      >
                        EXPLORE
                        <br />
                        MORE
                        <br />
                        CIRCLES
                      </span>
                    </div>
                  </button>
                )}
              </div>

              {selectionMode && (
                <div className="mt-8 space-y-4">
                  {exploreError ? (
                    <div className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3">
                      <p className={`${archivo.className} text-sm text-red-200`}>
                        {exploreError}
                      </p>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleExploreCommunity}
                    disabled={selectedActivitySlugs.length === 0 || submittingSelections}
                    className={`${bebas.className} w-full rounded-full bg-[#F7D3E7] px-4 py-3 text-lg uppercase tracking-wide text-black transition hover:opacity-90 disabled:opacity-50`}
                  >
                    {submittingSelections ? "Saving..." : "Explore My Community"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {isEventModalLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="rounded-3xl border border-white/10 bg-black px-6 py-5 text-white shadow-2xl">
            <p className={`${archivo.className} text-sm text-white/75`}>
              Loading event details...
            </p>
          </div>
        </div>
      )}

      <EventDetailModal
        event={selectedEvent}
        isSubmittingRsvp={isSubmittingRsvp}
        isCancellingRsvp={isCancellingRsvp}
        isCancellingEvent={isCancellingEvent}
        actionError={actionError}
        onClose={closeEventModal}
        onRsvp={handleRsvp}
        onCancelRsvp={handleCancelRsvp}
        onCancelEvent={handleCancelEvent}
      />
    </>
  );
}