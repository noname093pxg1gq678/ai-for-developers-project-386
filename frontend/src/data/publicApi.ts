// Адаптер публичных поверхностей (страница гостя и заглушка записи) над
// сгенерированным SDK (контракт - issue #1). Ошибки API превращаются
// в ApiError со статусом и понятным сообщением.

import { meetingTypesListTypes } from "../api";
import type { MeetingType } from "../api";
import { ApiError, toApiError } from "./apiError";

// Алиас общего класса ошибки для читаемости мест использования на публичной
// странице.
export { ApiError as PublicApiError };

function toPublicApiError(status: number, body: unknown): ApiError {
  return toApiError(status, body, "Не удалось загрузить данные");
}

export async function loadMeetingTypes(): Promise<MeetingType[]> {
  const result = await meetingTypesListTypes();
  if (result.error) {
    throw toPublicApiError(result.response?.status ?? 0, result.error);
  }
  return result.data ?? [];
}
