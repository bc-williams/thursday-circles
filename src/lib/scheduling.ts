export type TimeOption = {
    value: string;
    label: string;
  };
  
  export const MIN_HOURS_AHEAD = 2;
  export const DATE_OPTION_DAYS = 14;
  
  export function parseLocalDateTime(date: string, time: string) {
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  
    if (!dateMatch || !timeMatch) {
      return null;
    }
  
    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);
    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
  
    const parsed = new Date(year, month - 1, day, hours, minutes, 0, 0);
  
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day ||
      parsed.getHours() !== hours ||
      parsed.getMinutes() !== minutes
    ) {
      return null;
    }
  
    return parsed;
  }
  
  export function roundUpToNextHalfHour(date: Date) {
    const rounded = new Date(date);
    rounded.setSeconds(0, 0);
  
    const minutes = rounded.getMinutes();
  
    if (minutes === 0 || minutes === 30) {
      return rounded;
    }
  
    if (minutes < 30) {
      rounded.setMinutes(30, 0, 0);
      return rounded;
    }
  
    rounded.setHours(rounded.getHours() + 1);
    rounded.setMinutes(0, 0, 0);
    return rounded;
  }
  
  export function getEarliestAllowedDateTime(minHoursAhead = MIN_HOURS_AHEAD) {
    const now = new Date();
    const minDate = new Date(now.getTime() + minHoursAhead * 60 * 60 * 1000);
    const rounded = roundUpToNextHalfHour(minDate);
  
    if (rounded.getHours() < 7) {
      rounded.setHours(7, 0, 0, 0);
    }
  
    if (
      rounded.getHours() > 21 ||
      (rounded.getHours() === 21 && rounded.getMinutes() > 0)
    ) {
      rounded.setDate(rounded.getDate() + 1);
      rounded.setHours(7, 0, 0, 0);
    }
  
    return rounded;
  }
  
  export function formatDisplayTime(date: Date) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  
  export function formatDateLabel(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  }
  
  export function formatDateValue(date: Date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  
  export function formatTimeLabel(value: string) {
    const [hoursString, minutes] = value.split(":");
    const hours = Number(hoursString);
    const suffix = hours >= 12 ? "PM" : "AM";
    const normalizedHours = hours % 12 || 12;
    return `${normalizedHours}:${minutes} ${suffix}`;
  }
  
  export function generateDateOptions(days = DATE_OPTION_DAYS) {
    const today = new Date();
  
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
  
      return {
        value: formatDateValue(date),
        label: index === 0 ? `Today · ${formatDateLabel(date)}` : formatDateLabel(date),
      };
    });
  }
  
  export function generateTimeOptions() {
    const options: TimeOption[] = [];
  
    for (let hour = 7; hour <= 21; hour++) {
      for (const minute of [0, 30]) {
        if (hour === 21 && minute === 30) continue;
  
        const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        options.push({
          value,
          label: formatTimeLabel(value),
        });
      }
    }
  
    return options;
  }
  
  export function getDefaultProposalDateTime() {
    const earliestAllowed = getEarliestAllowedDateTime();
  
    return {
      date: formatDateValue(earliestAllowed),
      time: `${String(earliestAllowed.getHours()).padStart(2, "0")}:${String(
        earliestAllowed.getMinutes()
      ).padStart(2, "0")}`,
    };
  }
  
  export function isSameLocalDate(dateA: Date, dateB: Date) {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  }
  
  export function getAvailableTimeOptions(
    selectedDate: string,
    allTimeOptions: TimeOption[],
    minHoursAhead = MIN_HOURS_AHEAD
  ) {
    if (!selectedDate) return allTimeOptions;
  
    const selectedDateAtMidnight = parseLocalDateTime(selectedDate, "00:00");
    if (!selectedDateAtMidnight) return allTimeOptions;
  
    const earliestAllowed = getEarliestAllowedDateTime(minHoursAhead);
  
    if (!isSameLocalDate(selectedDateAtMidnight, earliestAllowed)) {
      return allTimeOptions;
    }
  
    return allTimeOptions.filter((option) => {
      const optionDateTime = parseLocalDateTime(selectedDate, option.value);
      return optionDateTime && optionDateTime.getTime() >= earliestAllowed.getTime();
    });
  }
  
  export function getEarliestAvailableLabel(selectedDate: string) {
    if (!selectedDate) return null;
  
    const selectedDateAtMidnight = parseLocalDateTime(selectedDate, "00:00");
    if (!selectedDateAtMidnight) return null;
  
    const earliestAllowed = getEarliestAllowedDateTime();
  
    if (!isSameLocalDate(selectedDateAtMidnight, earliestAllowed)) {
      return null;
    }
  
    return `Earliest available today: ${formatDisplayTime(earliestAllowed)}`;
  }