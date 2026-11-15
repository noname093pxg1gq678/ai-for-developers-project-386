// Хранилище в памяти процесса: перезапуск сбрасывает данные (issue #4).
// Бронирование слотов - issue #2, поэтому встречи добавляются тестовым
// хелпером seedMeeting и эндпоинтами брони пока не создаются.

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
  typeTitle: string;
  startsAt: string;
  guestName: string;
  guestEmail: string;
  comment?: string;
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

export function hasFutureMeetings(typeId: string, now = new Date()): boolean {
  return meetings.some(
    (meeting) =>
      meeting.typeId === typeId && meeting.startsAt > now.toISOString(),
  );
}

/** Тестовый хелпер: добавить встречу до реализации брони (issue #2). */
export function seedMeeting(meeting: MeetingRecord): void {
  meetings.push(meeting);
}
