// Генерация свободных стартов слотов над хранилищем (issue #11).
// Окно записи - 14 календарных дней от текущего дня, рабочее время
// пн-пт 09:00-18:00, шаг слотов 30 минут - всё в поясе владельца
// (ADR 0002). Прошедшие старты исключаются на момент запроса,
// пересечения со встречами запрещены, встречи «вплотную» разрешены.
// Текущее время инъецируется параметром now - детерминизм в тестах.

import type { MeetingRecord, MeetingTypeRecord } from "./store.js";

/** Окно записи: 14 календарных дней, начиная с текущего (контракт). */
export const BOOKING_WINDOW_DAYS = 14;

/** Пояс владельца: в нём считаются окно записи и рабочее время (ADR 0002). */
export const OWNER_TIMEZONE = "Europe/Moscow";

const SLOT_STEP_MINUTES = 30;
const WORK_START_MINUTES = 9 * 60;
const WORK_END_MINUTES = 18 * 60;
const MINUTE_MS = 60_000;

/** Смещение пояса в момент instant: «GMT+03:00» из Intl в миллисекунды. */
function timeZoneOffsetMs(instant: Date, timeZone: string): number {
  const timeZoneName = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(instant)
    .find((part) => part.type === "timeZoneName")?.value;
  const match = /^GMT([+-])(\d{2}):(\d{2})$/.exec(timeZoneName ?? "");
  if (!match) {
    return 0;
  }
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3])) * MINUTE_MS;
}

/** Календарная дата и минута суток instant-а в заданном поясе. */
function wallTime(instant: Date, timeZone: string) {
  const shifted = new Date(
    instant.getTime() + timeZoneOffsetMs(instant, timeZone),
  );
  return {
    year: shifted.getUTCFullYear(),
    // Месяц 0-индексный - удобно для Date.UTC.
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
    minuteOfDay: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

/** Мгновенье UTC заданных календарной даты и минуты суток в поясе. */
function wallToInstant(
  year: number,
  month: number,
  day: number,
  minuteOfDay: number,
  timeZone: string,
): number {
  // Полдень - внутри любых смещений пояса, поэтому год-месяц-день
  //(offset не переносит через сутки).
  const offset = timeZoneOffsetMs(
    new Date(Date.UTC(year, month, day, 12)),
    timeZone,
  );
  return Date.UTC(year, month, day, 0, minuteOfDay) - offset;
}

/** Пересекается ли интервал [start, start + durationMs) с какой-либо из
 * встреч (встречи «вплотную» разрешены, issue #12). Наложение запрещено:
 * интервалы пересекаются, когда старт одного раньше конца другого, и строгое
 * неравенство оставляет соприкасающиеся интервалы свободными.
 */
export function overlapsMeetings(
  types: readonly MeetingTypeRecord[],
  meetings: readonly MeetingRecord[],
  startMs: number,
  durationMs: number,
): boolean {
  const durationByType = new Map(
    types.map((type) => [type.id, type.durationMinutes * MINUTE_MS]),
  );
  return meetings.some((meeting) => {
    const busyStart = Date.parse(meeting.startsAt);
    const busyEnd = busyStart + (durationByType.get(meeting.typeId) ?? 0);
    return busyStart < startMs + durationMs && startMs < busyEnd;
  });
}

export function generateFreeStarts(
  types: readonly MeetingTypeRecord[],
  meetings: readonly MeetingRecord[],
  bookingType: MeetingTypeRecord,
  now: Date,
): string[] {
  const slotDurationMs = bookingType.durationMinutes * MINUTE_MS;

  const today = wallTime(now, OWNER_TIMEZONE);
  const starts: string[] = [];
  for (let dayOffset = 0; dayOffset < BOOKING_WINDOW_DAYS; dayOffset += 1) {
    const day = new Date(
      Date.UTC(today.year, today.month, today.day + dayOffset),
    );
    // Рабочие дни - понедельник по пятницу (контракт).
    const weekday = day.getUTCDay();
    if (weekday === 0 || weekday === 6) {
      continue;
    }
    const dayStart = wallToInstant(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      WORK_START_MINUTES,
      OWNER_TIMEZONE,
    );
    const dayEnd = wallToInstant(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      WORK_END_MINUTES,
      OWNER_TIMEZONE,
    );
    for (
      let start = dayStart;
      start + slotDurationMs <= dayEnd;
      start += SLOT_STEP_MINUTES * MINUTE_MS
    ) {
      // Прошедшие слоты исключены на момент запроса (контракт).
      if (start < now.getTime()) {
        continue;
      }
      // Пересечение запрещено, вплотную разрешено - предикат общий
      // с бронированием (issue #12).
      if (overlapsMeetings(types, meetings, start, slotDurationMs)) {
        continue;
      }
      starts.push(new Date(start).toISOString());
    }
  }
  return starts;
}
