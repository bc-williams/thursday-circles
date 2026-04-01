"use client";

import { useEffect, useMemo, useRef } from "react";
import { archivo, bebas } from "@/lib/fonts";
import {
  DATE_OPTION_DAYS,
  generateDateOptions,
  generateTimeOptions,
  getAvailableTimeOptions,
  getEarliestAvailableLabel,
  type TimeOption,
} from "@/lib/scheduling";

export type SelectedPlace = {
  name: string;
  address: string;
  placeId: string;
};

type MeetupProposalModalProps = {
  activityName: string;
  isOpen: boolean;
  isGoogleLoaded: boolean;
  googleLoadError: string | null;
  proposalTitle: string;
  proposalDate: string;
  proposalTime: string;
  proposalLocation: string;
  proposalError: string;
  isSubmittingProposal: boolean;
  selectedPlace: SelectedPlace | null;
  onClose: () => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onProposalTitleChange: (value: string) => void;
  onProposalDateChange: (value: string) => void;
  onProposalTimeChange: (value: string) => void;
  onProposalLocationChange: (value: string) => void;
  onSelectedPlaceChange: (place: SelectedPlace | null) => void;
};

function getProposalTitlePlaceholder(activityName: string) {
  switch (activityName.toLowerCase()) {
    case "pickleball":
      return "Friday pickleball at a local court";
    case "coworking":
      return "Tuesday work session at a local cafe";
    case "board games":
      return "Board game night at a local spot";
    case "run club":
      return "Evening run at a nearby park";
    case "trivia":
      return "Trivia night at a local bar";
    default:
      return "Propose a meetup";
  }
}

/**
 * Modal for proposing a new meetup within a circle activity.
 * Handles title, date/time selection, and venue lookup via Google Places.
 */
export default function MeetupProposalModal({
  activityName,
  isOpen,
  isGoogleLoaded,
  googleLoadError,
  proposalTitle,
  proposalDate,
  proposalTime,
  proposalLocation,
  proposalError,
  isSubmittingProposal,
  selectedPlace,
  onClose,
  onSubmit,
  onProposalTitleChange,
  onProposalDateChange,
  onProposalTimeChange,
  onProposalLocationChange,
  onSelectedPlaceChange,
}: MeetupProposalModalProps) {
  const locationInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const dateOptions = useMemo(() => generateDateOptions(DATE_OPTION_DAYS), []);
  const allTimeOptions = useMemo<TimeOption[]>(() => generateTimeOptions(), []);
  const availableTimeOptions = useMemo(
    () => getAvailableTimeOptions(proposalDate, allTimeOptions),
    [proposalDate, allTimeOptions]
  );
  const earliestAvailableLabel = useMemo(
    () => getEarliestAvailableLabel(proposalDate),
    [proposalDate]
  );

  useEffect(() => {
    if (!isOpen || !isGoogleLoaded || !locationInputRef.current) {
      return;
    }

    if (autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      locationInputRef.current,
      {
        fields: ["place_id", "name", "formatted_address"],
        types: ["establishment"],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      const placeName = place.name ?? "";
      const placeAddress = place.formatted_address ?? "";
      const placeId = place.place_id ?? "";

      const combinedLocation =
        placeName && placeAddress
          ? `${placeName}, ${placeAddress}`
          : placeAddress || placeName;

      onProposalLocationChange(combinedLocation);
      onSelectedPlaceChange({
        name: placeName,
        address: placeAddress,
        placeId,
      });
    });

    autocompleteRef.current = autocomplete;
  }, [isOpen, isGoogleLoaded, onProposalLocationChange, onSelectedPlaceChange]);

  useEffect(() => {
    if (!isOpen) {
      autocompleteRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!proposalDate) return;

    if (availableTimeOptions.length === 0) {
      if (proposalTime !== "") {
        onProposalTimeChange("");
      }
      return;
    }

    const isCurrentTimeStillValid = availableTimeOptions.some(
      (option) => option.value === proposalTime
    );

    if (!isCurrentTimeStillValid) {
      onProposalTimeChange(availableTimeOptions[0].value);
    }
  }, [proposalDate, proposalTime, availableTimeOptions, onProposalTimeChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-4 pt-12 animate-[fadeIn_180ms_ease-out] sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black p-6 text-white shadow-2xl animate-[slideUp_260ms_ease-out] sm:animate-[fadeIn_180ms_ease-out]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className={`${bebas.className} text-3xl uppercase leading-[0.95]`}>
            {`Propose a ${activityName} meetup`}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-white/60 transition hover:text-white"
            aria-label="Close meetup proposal modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="proposal-title"
              className={`${archivo.className} mb-2 block text-sm text-white/70`}
            >
              Meetup title
            </label>
            <input
              id="proposal-title"
              type="text"
              value={proposalTitle}
              onChange={(e) => onProposalTitleChange(e.target.value)}
              placeholder={getProposalTitlePlaceholder(activityName)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#EFAFD0] focus:ring-2 focus:ring-[#EFAFD0]/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="proposal-date"
                className={`${archivo.className} mb-2 block text-sm text-white/70`}
              >
                Date
              </label>

              <select
                id="proposal-date"
                value={proposalDate}
                onChange={(e) => onProposalDateChange(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#EFAFD0] focus:ring-2 focus:ring-[#EFAFD0]/30"
              >
                {dateOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-black text-white"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="proposal-time"
                className={`${archivo.className} mb-2 block text-sm text-white/70`}
              >
                Time
              </label>

              <select
                id="proposal-time"
                value={proposalTime}
                onChange={(e) => onProposalTimeChange(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#EFAFD0] focus:ring-2 focus:ring-[#EFAFD0]/30"
              >
                {availableTimeOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-black text-white"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="-mt-1 space-y-1">
            <p className={`${archivo.className} text-xs text-white/45`}>
              Meetups must be scheduled at least two hours in advance.
            </p>
            {earliestAvailableLabel ? (
              <p className={`${archivo.className} text-xs text-[#EFAFD0]`}>
                {earliestAvailableLabel}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="proposal-location"
              className={`${archivo.className} mb-2 block text-sm text-white/70`}
            >
              Venue / public location
            </label>
            <input
              ref={locationInputRef}
              id="proposal-location"
              type="text"
              value={proposalLocation}
              onChange={(e) => {
                onProposalLocationChange(e.target.value);
                if (selectedPlace) {
                  onSelectedPlaceChange(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              placeholder="Start typing a venue name..."
              autoComplete="off"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#EFAFD0] focus:ring-2 focus:ring-[#EFAFD0]/30"
            />
            <p className={`${archivo.className} mt-2 text-xs text-white/45`}>
              Choose a real public venue from Google Places suggestions.
            </p>
          </div>

          {proposalError ? (
            <div className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3">
              <p className={`${archivo.className} text-sm text-red-200`}>
                {proposalError}
              </p>
            </div>
          ) : null}

          {googleLoadError ? (
            <p className={`${archivo.className} text-sm text-red-300`}>
              {googleLoadError}
            </p>
          ) : null}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmittingProposal || availableTimeOptions.length === 0}
              className={`${bebas.className} w-full rounded-full bg-[#F7D3E7] px-4 py-3 text-lg uppercase tracking-wide text-black transition duration-200 hover:opacity-95 hover:shadow-[0_0_20px_rgba(247,211,231,0.35)] focus:outline-none focus:ring-2 focus:ring-[#F7D3E7] disabled:opacity-50`}
            >
              {isSubmittingProposal ? "Creating..." : "Create meetup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}