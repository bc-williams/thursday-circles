import { z } from "zod";
import {
  getEarliestAllowedDateTime,
  parseLocalDateTime,
} from "@/lib/scheduling";

export const demoUserKeySchema = z.string();

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Value is required")
  .regex(/^[a-z0-9-]+$/, "Must be a valid slug");

export const positiveIntSchema = z.coerce
  .number()
  .int("Must be an integer")
  .positive("Must be greater than 0");

export const selectedPlaceSchema = z.object({
  name: z.string().trim().min(1, "Place name is required"),
  address: z.string().trim().min(1, "Place address is required"),
  placeId: z.string().trim().min(1, "Please choose a real venue from the suggestions."),
});

export const proposeEventSchema = z
  .object({
    user: demoUserKeySchema,
    city: slugSchema,
    activity: slugSchema,
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(80, "Title must be 80 characters or less"),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    location: z
      .string()
      .trim()
      .min(2, "Location is required")
      .max(200, "Location must be 200 characters or less"),
    placeId: selectedPlaceSchema.shape.placeId,
    placeName: selectedPlaceSchema.shape.name,
    placeAddress: selectedPlaceSchema.shape.address,
  })
  .superRefine((data, ctx) => {
    const parsedDateTime = parseLocalDateTime(data.date, data.time);

    if (!parsedDateTime) {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: "Please choose a valid date and time.",
      });
      return;
    }

    const earliestAllowed = getEarliestAllowedDateTime();

    if (parsedDateTime.getTime() < earliestAllowed.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["time"],
        message: "Meetups must be scheduled at least two hours in advance.",
      });
    }
  });

export const rsvpSchema = z.object({
  user: demoUserKeySchema,
  eventId: z.coerce
    .number()
    .int("Event ID must be an integer")
    .positive("Event ID must be greater than 0"),
});

export const cancelRsvpSchema = rsvpSchema;
export const cancelEventSchema = rsvpSchema;

export const joinCircleSchema = z.object({
  user: demoUserKeySchema,
  activitySlug: slugSchema,
});

export type DemoUserKey = z.infer<typeof demoUserKeySchema>;
export type SelectedPlaceInput = z.infer<typeof selectedPlaceSchema>;
export type ProposeEventInput = z.infer<typeof proposeEventSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
export type CancelRsvpInput = z.infer<typeof cancelRsvpSchema>;
export type CancelEventInput = z.infer<typeof cancelEventSchema>;
export type JoinCircleInput = z.infer<typeof joinCircleSchema>;