// Данные первого этапа: фиксированный список типов встреч.
// Когда контракт API зафиксирован (issue #1), модуль заменяется на вызов
// сгенерированного SDK, компоненты при этом не меняются (issue #3).

export interface MeetingType {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
}

// Список упорядочен по времени создания, новые сверху (issue #3).
export const DEMO_MEETING_TYPES: MeetingType[] = [
  {
    id: "intro-call",
    title: "Вводный звонок",
    description: "Знакомство и короткий разговор о задаче.",
    durationMinutes: 20,
  },
  {
    id: "call-45",
    title: "Звонок на 45 минут",
    description: "Созвон для обсуждения проекта. Подготовьте вопросы заранее.",
    durationMinutes: 45,
  },
];

export async function fetchMeetingTypes(): Promise<MeetingType[]> {
  return DEMO_MEETING_TYPES.map((type) => ({ ...type }));
}
