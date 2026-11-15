// Валидация данных типа встречи по контракту: title до 100 и обязателен,
// description до 500 и обязателен, длительность - целые минуты 5-240.

export interface MeetingTypeBody {
  title: string;
  description: string;
  durationMinutes: number;
}

export type MeetingTypeValidation =
  | { input: MeetingTypeBody }
  | { error: string };

export function validateMeetingTypeBody(body: unknown): MeetingTypeValidation {
  if (typeof body !== "object" || body === null) {
    return {
      error:
        "Ожидается JSON-объект с полями title, description и durationMinutes",
    };
  }
  const { title, description, durationMinutes } = body as Record<
    string,
    unknown
  >;

  if (typeof title !== "string" || title.length === 0) {
    return { error: "Название обязательно" };
  }
  if (title.length > 100) {
    return { error: "Название не может быть длиннее 100 символов" };
  }
  if (typeof description !== "string" || description.length === 0) {
    return { error: "Описание обязательно" };
  }
  if (description.length > 500) {
    return { error: "Описание не может быть длиннее 500 символов" };
  }
  if (
    typeof durationMinutes !== "number" ||
    !Number.isInteger(durationMinutes)
  ) {
    return { error: "Длительность должна быть целым числом минут" };
  }
  if (durationMinutes < 5 || durationMinutes > 240) {
    return { error: "Длительность должна быть от 5 до 240 минут" };
  }
  return { input: { title, description, durationMinutes } };
}
