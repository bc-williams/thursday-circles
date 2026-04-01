"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { archivo, barlowBlack, bebas } from "@/lib/fonts";
import { cityOptions } from "@/lib/cities";
import { useGoogleMaps } from "@/lib/useGoogleMaps";
import { proposeEventSchema } from "@/lib/validators";
import { getDefaultProposalDateTime } from "@/lib/scheduling";
import Avatar from "@/components/avatar";
import CustomDropdown from "@/components/custom-dropdown";
import MeetupProposalModal, {
  type SelectedPlace,
} from "@/components/meetup-proposal-modal";
import EventDetailModal, {
  type EventModalEvent,
} from "@/components/event-detail-modal";
import ProfilePhotoRequiredModal from "@/components/profile-photo-required-modal";

type Event = EventModalEvent;

type CityData = {
  cityName: string;
  description: string;
};

type ActivityPageTemplateProps = {
  activityName: string;
  activitySlug: string;
  selectedCity: string;
  currentUser: string;
  cityData: CityData;
  memberCount: number;
  upcomingMeetupCount: number;
  events: Event[];
};

const cityDropdownOptions = cityOptions.map((city) => ({
  value: city.slug,
  label: city.name,
}));

export default function ActivityPageTemplate({
  activityName,
  activitySlug,
  selectedCity,
  currentUser,
  cityData,
  memberCount = 0,
  // Intentionally unused for now; keeping it in the interface avoids breaking callers.
  upcomingMeetupCount = 0,
  events = [],
}: ActivityPageTemplateProps) {
  const router = useRouter();
  const { isLoaded: isGoogleLoaded, loadError: googleLoadError } = useGoogleMaps();

  const [eventState, setEventState] = useState<Event[]>(events);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [isCancellingRsvp, setIsCancellingRsvp] = useState(false);
  const [isCancellingEvent, setIsCancellingEvent] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isPhotoRequiredModalOpen, setIsPhotoRequiredModalOpen] = useState(false);
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalDate, setProposalDate] = useState("");
  const [proposalTime, setProposalTime] = useState("");
  const [proposalLocation, setProposalLocation] = useState("");
  const [proposalError, setProposalError] = useState("");
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);

  useEffect(() => {
    setEventState(events);
  }, [events]);

  const displayedUpcomingMeetupCount = useMemo(() => eventState.length, [eventState]);

  function openEventModal(event: Event) {
    setSelectedEvent(event);
    setActionError(null);
  }

  function closeEventModal() {
    setSelectedEvent(null);
    setActionError(null);
  }

  function openProposalModal() {
    const userNeedsPhoto = currentUser === "newcirclesuser";
    // Demo guard: only "newcirclesuser" lacks a profile photo in seeded data.
    // Backend still enforces the real photo requirement.
    if (userNeedsPhoto) {
      setIsPhotoRequiredModalOpen(true);
      return;
    }

    const defaults = getDefaultProposalDateTime();

    setProposalError("");
    setProposalDate(defaults.date);
    setProposalTime(defaults.time);
    setIsProposalModalOpen(true);
  }

  function closeProposalModal() {
    setIsProposalModalOpen(false);
    setProposalTitle("");
    setProposalDate("");
    setProposalTime("");
    setProposalLocation("");
    setProposalError("");
    setSelectedPlace(null);
  }

  function closePhotoRequiredModal() {
    setIsPhotoRequiredModalOpen(false);
  }

  function handleAddProfilePhoto() {
    setIsPhotoRequiredModalOpen(false);
  }

  async function handleSubmitProposal(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setProposalError("");

    const payload = {
      user: currentUser,
      city: selectedCity,
      activity: activitySlug,
      title: proposalTitle,
      date: proposalDate,
      time: proposalTime,
      location: proposalLocation,
      placeId: selectedPlace?.placeId ?? "",
      placeName: selectedPlace?.name ?? "",
      placeAddress: selectedPlace?.address ?? "",
    };

    const validationResult = proposeEventSchema.safeParse(payload);

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      setProposalError(firstIssue?.message ?? "Please check your inputs.");
      return;
    }

    try {
      setIsSubmittingProposal(true);

      const validatedPayload = validationResult.data;

      console.log("Submitting meetup payload:", validatedPayload);

      const res = await fetch("/api/propose-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedPayload),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: Record<string, unknown> | null = null;

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response from /api/propose-event:", {
          status: res.status,
          statusText: res.statusText,
          contentType,
          body: text,
        });

        throw new Error(
          "The server returned a non-JSON response. Check the terminal and network tab."
        );
      }

      console.log("Create meetup response:", {
        status: res.status,
        ok: res.ok,
        data,
      });

      if (!res.ok) {
        if (data?.code === "MISSING_PROFILE_PHOTO") {
          closeProposalModal();
          setIsPhotoRequiredModalOpen(true);
          return;
        }
      
        throw new Error(
          typeof data?.error === "string" ? data.error : "Failed to create meetup"
        );
      }
      
      const newEvent = data?.event as Event | undefined;
      if (
        !newEvent ||
        typeof newEvent.title !== "string" ||
        typeof newEvent.time !== "string" ||
        typeof newEvent.location !== "string" ||
        typeof newEvent.host !== "string" ||
        typeof newEvent.rsvps !== "string"
      ) {
        console.error("Invalid event payload from /api/propose-event:", data);
        throw new Error("Server returned JSON, but not a valid event payload.");
      }

      setEventState((prev) => [newEvent, ...prev]);
      closeProposalModal();
    } catch (error) {
      console.error("Error creating meetup:", error);
      setProposalError(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your meetup."
      );
    } finally {
      setIsSubmittingProposal(false);
    }
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

      setEventState((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                isUserGoing: true,
                attendeeCount: data.attendeeCount,
                rsvps: `${data.attendeeCount} RSVP${data.attendeeCount === 1 ? "" : "s"}`,
                attendees: data.attendees,
              }
            : event
        )
      );

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
      setActionError(error instanceof Error ? error.message : "Something went wrong.");
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

      setEventState((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                isUserGoing: false,
                attendeeCount: data.attendeeCount,
                rsvps: `${data.attendeeCount} RSVP${data.attendeeCount === 1 ? "" : "s"}`,
                attendees: data.attendees,
              }
            : event
        )
      );

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
    } catch (error) {
      console.error("Error cancelling RSVP:", error);
      setActionError(error instanceof Error ? error.message : "Something went wrong.");
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

      setEventState((prev) => prev.filter((event) => event.id !== eventId));
      closeEventModal();
    } catch (error) {
      console.error("Error cancelling event:", error);
      setActionError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsCancellingEvent(false);
    }
  }

  function getStatusLabel(event: Event) {
    if (event.isHostedByCurrentUser) return "Hosting";
    if (event.isUserGoing) return "Going";
    return "RSVP";
  }

  function getStatusClasses(event: Event) {
    if (event.isHostedByCurrentUser) {
      return "bg-white/10 text-white";
    }

    if (event.isUserGoing) {
      return "bg-[#EFAFD0] text-black";
    }

    return "border border-[#EFAFD0] text-[#EFAFD0]";
  }

  return (
    <>
      <main className="min-h-screen bg-black flex justify-center">
        <div className="w-full max-w-md px-6 pt-6 pb-10 text-white">
          <div className="mb-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <Link
                href={`/circles?city=${selectedCity}&user=${currentUser}`}
                className="text-sm uppercase tracking-[0.2em] text-white/60 hover:text-white transition"
              >
                Thursday Circles
              </Link>

              <div className="relative -mt-1 shrink-0">
                <CustomDropdown
                  value={selectedCity}
                  options={cityDropdownOptions}
                  ariaLabel="Select city"
                  onChange={(value) =>
                    router.push(
                      `/circles/${activitySlug}?city=${value}&user=${currentUser}`
                    )
                  }
                  buttonClassName={`${bebas.className} min-w-[140px] bg-transparent px-1 text-right text-xl uppercase text-white`}
                  menuClassName="w-[180px]"
                  optionClassName={`${bebas.className} text-lg uppercase`}
                />
              </div>
            </div>

            <h1
              className={`${barlowBlack.className} text-5xl uppercase leading-[0.9]`}
            >
              {activityName} in
              <br />
              {cityData.cityName}
            </h1>

            <p className={`${archivo.className} mt-3 text-white/70`}>
              {cityData.description}
            </p>
          </div>

          <div className="mb-6 flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <div>
              <p className="text-sm text-white/60">Members</p>
              <p className="text-lg font-semibold">{memberCount}</p>
            </div>

            <div>
              <p className="text-sm text-white/60">Upcoming meetups</p>
              <p className="text-lg font-semibold">{displayedUpcomingMeetupCount}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={openProposalModal}
            className={`${bebas.className} mb-8 w-full rounded-full bg-[#F7D3E7] px-4 py-3 text-lg uppercase tracking-wide text-black transition duration-200 hover:opacity-95 hover:shadow-[0_0_20px_rgba(247,211,231,0.35)] focus:outline-none focus:ring-2 focus:ring-[#F7D3E7]`}
          >
            {`Propose a ${activityName.toLowerCase()} meetup`}
          </button>

          <div className="space-y-4">
            {eventState
              .filter((event): event is Event => Boolean(event))
              .map((event) => (
                <button
                  key={event.id ?? event.title}
                  type="button"
                  onClick={() => {
                    if (!event.id) return;
                    openEventModal(event);
                  }}
                  className="w-full rounded-3xl border border-white/10 bg-white/5 p-5 text-left cursor-pointer transition-all duration-200 hover:border-white/30 hover:bg-white/[0.08] hover:shadow-[0_0_18px_rgba(255,255,255,0.15)]"
                >
                  <h2 className={`${bebas.className} text-3xl uppercase tracking-wide`}>
                    {event.title}
                  </h2>

                  <p className="mt-3 text-white/70">{event.time}</p>
                  <p className="text-white/70">{event.location}</p>

                  <div className="mt-3 flex items-center gap-3">
                    <Avatar
                      name={event.hostName ?? event.host}
                      photoUrl={event.hostPhotoUrl}
                      isCurrentUser={event.isHostedByCurrentUser}
                      size="sm"
                    />
                    <p className="text-sm text-white/60">{event.host}</p>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#EFAFD0]">
                      {event.rsvps}
                    </span>

                    <span
                      className={`rounded-full px-4 py-2 text-sm font-medium ${getStatusClasses(
                        event
                      )}`}
                    >
                      {getStatusLabel(event)}
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </main>

      <MeetupProposalModal
        activityName={activityName}
        isOpen={isProposalModalOpen}
        isGoogleLoaded={isGoogleLoaded}
        googleLoadError={googleLoadError}
        proposalTitle={proposalTitle}
        proposalDate={proposalDate}
        proposalTime={proposalTime}
        proposalLocation={proposalLocation}
        proposalError={proposalError}
        isSubmittingProposal={isSubmittingProposal}
        selectedPlace={selectedPlace}
        onClose={closeProposalModal}
        onSubmit={handleSubmitProposal}
        onProposalTitleChange={setProposalTitle}
        onProposalDateChange={setProposalDate}
        onProposalTimeChange={setProposalTime}
        onProposalLocationChange={setProposalLocation}
        onSelectedPlaceChange={setSelectedPlace}
      />

      <ProfilePhotoRequiredModal
        isOpen={isPhotoRequiredModalOpen}
        onClose={closePhotoRequiredModal}
        onAddPhoto={handleAddProfilePhoto}
      />

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