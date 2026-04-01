"use client";

import { useState } from "react";
import { archivo, bebas } from "@/lib/fonts";
import Avatar from "@/components/avatar";
import PhotoModal from "@/components/photo-modal";

export type EventModalAttendee = {
  id: number;
  name: string;
  photoUrl?: string | null;
  isCurrentUser?: boolean;
};

export type EventModalEvent = {
  id?: number;
  title: string;
  time: string;
  location: string;
  host: string;
  hostUserId?: number;
  hostName?: string;
  hostPhotoUrl?: string | null;
  isHostedByCurrentUser?: boolean;
  rsvps: string;
  attendeeCount?: number;
  isUserGoing?: boolean;
  attendees?: EventModalAttendee[];
};

type EventDetailModalProps = {
  event: EventModalEvent | null;
  isSubmittingRsvp: boolean;
  isCancellingRsvp: boolean;
  isCancellingEvent: boolean;
  onClose: () => void;
  onRsvp: (eventId: number) => void;
  onCancelRsvp: (eventId: number) => void;
  onCancelEvent: (eventId: number) => void;
  actionError?: string | null;
};

function formatAttendeeLabel(name: string, isCurrentUser?: boolean) {
  if (isCurrentUser) return "You";

  const [firstName = "", lastName = ""] = name.split(" ");
  const lastInitial = lastName ? `${lastName.charAt(0)}.` : "";

  return `${firstName} ${lastInitial}`.trim();
}

export default function EventDetailModal({
  event,
  isSubmittingRsvp,
  isCancellingRsvp,
  isCancellingEvent,
  onClose,
  onRsvp,
  onCancelRsvp,
  onCancelEvent,
  actionError,
}: EventDetailModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    name: string;
  } | null>(null);

  if (!event) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-4 pt-12 animate-[fadeIn_180ms_ease-out] sm:items-center">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black p-6 text-white shadow-2xl animate-[slideUp_260ms_ease-out] sm:animate-[fadeIn_180ms_ease-out]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 className={`${bebas.className} text-3xl uppercase leading-[0.95]`}>
              {event.title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="text-white/60 transition hover:text-white"
              aria-label="Close RSVP modal"
            >
              ✕
            </button>
          </div>

          <p className="text-white/70">{event.time}</p>
          <p className="text-white/70">{event.location}</p>

          <div className="mt-3 flex items-center gap-3">
            <Avatar
              name={event.hostName ?? event.host}
              photoUrl={event.hostPhotoUrl}
              isCurrentUser={event.isHostedByCurrentUser}
              size="sm"
              onClick={
                event.hostPhotoUrl
                  ? () =>
                      setSelectedPhoto({
                        url: event.hostPhotoUrl!,
                        name: event.hostName ?? event.host,
                      })
                  : undefined
              }
            />
            <p className="text-sm text-white/60">{event.host}</p>
          </div>

          <div className="mt-6">
            <p className={`${bebas.className} text-2xl uppercase tracking-wide text-white`}>
              Who’s Going
            </p>

            <div className="mt-4 space-y-3">
              {(event.attendees ?? []).length > 0 ? (
                (event.attendees ?? []).map((attendee) => (
                  <div key={attendee.id} className="flex items-center gap-3">
                    <Avatar
                      name={attendee.name}
                      photoUrl={attendee.photoUrl}
                      isCurrentUser={attendee.isCurrentUser}
                    />

                    <span className={`${archivo.className} text-sm text-white/85`}>
                      {formatAttendeeLabel(attendee.name, attendee.isCurrentUser)}
                    </span>
                  </div>
                ))
              ) : (
                <p className={`${archivo.className} text-sm text-white/60`}>
                  No one’s in yet. Be the first.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {actionError ? (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3">
                <p className={`${archivo.className} text-sm text-red-200`}>
                  {actionError}
                </p>
              </div>
            ) : null}

            {event.isHostedByCurrentUser ? (
              <button
                type="button"
                onClick={() => event.id && onCancelEvent(event.id)}
                disabled={isCancellingEvent}
                className={`${bebas.className} w-full rounded-full border border-red-400 px-4 py-3 text-lg uppercase tracking-wide text-red-300 transition hover:bg-red-400 hover:text-black disabled:opacity-50`}
              >
                {isCancellingEvent ? "Cancelling..." : "Cancel Event"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    event.id && !(event.isUserGoing ?? false) ? onRsvp(event.id) : undefined
                  }
                  disabled={(event.isUserGoing ?? false) || isSubmittingRsvp}
                  className={`${bebas.className} w-full rounded-full bg-[#F7D3E7] px-4 py-3 text-lg uppercase tracking-wide text-black transition hover:opacity-90 disabled:opacity-50`}
                >
                  {event.isUserGoing ?? false
                    ? "Going"
                    : isSubmittingRsvp
                      ? "Joining..."
                      : "I’m in!"}
                </button>

                {(event.isUserGoing ?? false) && event.id && (
                  <button
                    type="button"
                    onClick={() => onCancelRsvp(event.id!)}
                    disabled={isCancellingRsvp}
                    className={`${bebas.className} w-full rounded-full border border-[#EFAFD0] px-4 py-3 text-lg uppercase tracking-wide text-[#EFAFD0] transition hover:bg-[#EFAFD0] hover:text-black disabled:opacity-50`}
                  >
                    {isCancellingRsvp ? "Cancelling..." : "Cancel RSVP"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedPhoto && (
        <PhotoModal
          photoUrl={selectedPhoto.url}
          name={selectedPhoto.name}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}