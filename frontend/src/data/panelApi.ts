// Адаптер панели владельца над сгенерированным SDK (контракт - issue #1).
// Ошибки API превращаются в PanelApiError со статусом и понятным сообщением.

import {
  meetingTypesCreateType,
  meetingTypesDeleteType,
  meetingTypesListTypes,
  meetingTypesUpdateType,
  meetingsList,
} from "../api";
import type { Meeting, MeetingType, MeetingTypeInput } from "../api";

/** Ошибка запроса к API панели: статус HTTP и понятное сообщение. */
export class PanelApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function toPanelApiError(status: number, body: unknown): PanelApiError {
  const message =
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
      ? body.message
      : "Не удалось выполнить запрос";
  return new PanelApiError(status, message);
}

export async function loadPanelMeetingTypes(): Promise<MeetingType[]> {
  const result = await meetingTypesListTypes();
  if (result.error) {
    throw toPanelApiError(result.response?.status ?? 0, result.error);
  }
  return result.data ?? [];
}

export async function createPanelMeetingType(
  input: MeetingTypeInput,
): Promise<MeetingType> {
  const result = await meetingTypesCreateType({ body: input });
  if (result.error) {
    throw toPanelApiError(result.response?.status ?? 0, result.error);
  }
  return result.data;
}

export async function updatePanelMeetingType(
  id: string,
  input: MeetingTypeInput,
): Promise<MeetingType> {
  const result = await meetingTypesUpdateType({ path: { id }, body: input });
  if (result.error) {
    throw toPanelApiError(result.response?.status ?? 0, result.error);
  }
  return result.data;
}

export async function deletePanelMeetingType(id: string): Promise<void> {
  const result = await meetingTypesDeleteType({ path: { id } });
  if (result.error) {
    throw toPanelApiError(result.response?.status ?? 0, result.error);
  }
}

export async function loadPanelMeetings(): Promise<Meeting[]> {
  const result = await meetingsList();
  if (result.error) {
    throw toPanelApiError(result.response?.status ?? 0, result.error);
  }
  return result.data ?? [];
}
