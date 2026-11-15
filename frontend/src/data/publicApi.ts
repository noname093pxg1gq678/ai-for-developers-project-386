// Адаптер публичных поверхностей (страница гостя и заглушка записи) над
// сгенерированным SDK (контракт - issue #1). Ошибки API превращаются
// в PublicApiError со статусом и понятным сообщением.

import { meetingTypesListTypes } from "../api";
import type { MeetingType } from "../api";

/** Ошибка запроса к API с публичной страницы: статус HTTP и понятное сообщение. */
export class PublicApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function toPublicApiError(status: number, body: unknown): PublicApiError {
  const message =
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
      ? body.message
      : "Не удалось загрузить данные";
  return new PublicApiError(status, message);
}

export async function loadMeetingTypes(): Promise<MeetingType[]> {
  const result = await meetingTypesListTypes();
  if (result.error) {
    throw toPublicApiError(result.response?.status ?? 0, result.error);
  }
  return result.data ?? [];
}
