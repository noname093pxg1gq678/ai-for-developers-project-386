// Данные первого этапа: фиксированный список типов встреч.
// Когда контракт API зафиксирован (issue #1), модуль заменяется на вызов
// сгенерированного SDK, компоненты при этом не меняются (issue #3).

export interface MeetingType {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  createdAt: string;
}

// Порядок в массиве не значим: fetchMeetingTypes возвращает типы
// по времени создания, новые сверху (issue #3). Контракт API обязан
// зафиксировать порядок выдачи аналогично (issue #1).
export const DEMO_MEETING_TYPES: MeetingType[] = [
  {
    id: "call-45",
    title: "Звонок на 45 минут",
    description: "Созвон для обсуждения проекта. Подготовьте вопросы заранее.",
    durationMinutes: 45,
    createdAt: "2026-11-10T09:00:00Z",
  },
  {
    id: "intro-call",
    title: "Вводный звонок",
    description: "Знакомство и короткий разговор о задаче.",
    durationMinutes: 20,
    createdAt: "2026-11-12T14:00:00Z",
  },
];

export async function fetchMeetingTypes(): Promise<MeetingType[]> {
  return [...DEMO_MEETING_TYPES]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((type) => ({ ...type }));
}
