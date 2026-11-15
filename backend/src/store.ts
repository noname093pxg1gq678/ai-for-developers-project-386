// Хранилище в памяти процесса: перезапуск сбрасывает данные (issue #4).
// Бронирование слотов - issue #2, поэтому встречи добавляются тестовым
// хелпером seedMeeting и эндпоинтами брони пока не создаются.

import { generateFreeStarts } from "./slots.js";

export interface MeetingTypeRecord {
  id: string;
  createdAt: string;
  title: string;
  description: string;
  durationMinutes: number;
}

export interface MeetingRecord {
  id: string;
  typeId: string;
  startsAt: string;
  guestName: string;
  guestEmail: string;
  comment?: string;
}

/** Встреча для чтения: название типа подставляется на момент чтения. */
export interface MeetingView extends MeetingRecord {
  typeTitle: string;
}

const meetingTypes: MeetingTypeRecord[] = [];
const meetings: MeetingRecord[] = [];

export function resetStore(): void {
  meetingTypes.length = 0;
  meetings.length = 0;
}

export function listMeetingTypes(): MeetingTypeRecord[] {
  // Типы отдаются по времени создания, новые сверху (контракт).
  return [...meetingTypes].reverse();
}

export function createMeetingType(
  input: Omit<MeetingTypeRecord, "id" | "createdAt">,
): MeetingTypeRecord {
  const record: MeetingTypeRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  meetingTypes.push(record);
  return record;
}

export function updateMeetingType(
  id: string,
  input: Omit<MeetingTypeRecord, "id" | "createdAt">,
): MeetingTypeRecord | undefined {
  const record = meetingTypes.find((type) => type.id === id);
  if (!record) {
    return undefined;
  }
  record.title = input.title;
  record.description = input.description;
  record.durationMinutes = input.durationMinutes;
  return record;
}

export function deleteMeetingType(id: string): boolean {
  const index = meetingTypes.findIndex((type) => type.id === id);
  if (index === -1) {
    return false;
  }
  meetingTypes.splice(index, 1);
  return true;
}

export function meetingTypeExists(id: string): boolean {
  return meetingTypes.some((type) => type.id === id);
}

/** Предстоящая встреча: момент начала ещё не наступил. */
function isUpcoming(startsAt: string, now: Date): boolean {
  // Даты нормализованы к UTC Z при записи, поэтому лексикографическое
  // сравнение ISO-строк корректно.
  return startsAt > now.toISOString();
}

export function hasFutureMeetings(typeId: string, now = new Date()): boolean {
  return meetings.some(
    (meeting) => meeting.typeId === typeId && isUpcoming(meeting.startsAt, now),
  );
}

export function listUpcomingMeetings(now = new Date()): MeetingView[] {
  // Предстоящие встречи по возрастанию времени начала, прошедшие исключены
  // (контракт: GET /api/meetings).
  // Название типа не хранится в записи, а вычисляется при чтении
  // (история 11): у предстоящих встреч тип существует всегда - удаление
  // типа с будущими встречами запрещено.
  return meetings
    .filter((meeting) => isUpcoming(meeting.startsAt, now))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((meeting) => {
      const type = meetingTypes.find(
        (candidate) => candidate.id === meeting.typeId,
      );
      return { ...meeting, typeTitle: type?.title ?? "" };
    });
}

/** Свободные старты слотов типа в окне записи, UTC ISO-строки (issue #11).
 * Текущее время инъецируется параметром - детерминизм в тестах.
 */
export function listFreeSlots(typeId: string, now = new Date()): string[] {
  const type = meetingTypes.find((candidate) => candidate.id === typeId);
  if (!type) {
    return [];
  }
  return generateFreeStarts(meetingTypes, meetings, type, now);
}

/** Тестовый хелпер: добавить встречу до реализации брони (issue #2). */
export function seedMeeting(meeting: MeetingRecord): void {
  // Даты нормализуются при записи в стор: момент начала хранится в UTC Z
  // независимо от формы смещения пояса во входной строке.
  meetings.push({
    ...meeting,
    startsAt: new Date(meeting.startsAt).toISOString(),
  });
}
