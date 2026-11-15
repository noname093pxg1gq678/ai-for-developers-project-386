import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BookingPage from "./BookingPage";
import { loadMeetingTypes } from "../data/publicApi";
import type { MeetingType } from "../api";
import { renderWithProviders } from "../test/renderWithProviders";

vi.mock("../data/publicApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../data/publicApi")>();
  return { ...actual, loadMeetingTypes: vi.fn() };
});

const loadMock = vi.mocked(loadMeetingTypes);

const SAMPLE_TYPES: MeetingType[] = [
  {
    id: "call-45",
    title: "Звонок на 45 минут",
    description: "Созвон для обсуждения проекта.",
    durationMinutes: 45,
    createdAt: "2026-11-10T09:00:00Z",
  },
];

function renderAt(url: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/book/:typeId" element={<BookingPage />} />
    </Routes>,
    url,
  );
}

beforeEach(() => {
  loadMock.mockReset();
  loadMock.mockResolvedValue(SAMPLE_TYPES);
});

describe("заглушка страницы записи", () => {
  it("показывает заголовок, тип встречи и длительность из API", async () => {
    renderAt("/book/call-45");

    expect(
      screen.getByRole("heading", { name: "Запись на встречу" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Звонок на 45 минут - 45 минут"),
    ).toBeInTheDocument();
  });

  it("пока типы грузятся, не показывает ни тип, ни сразу заглушку", () => {
    loadMock.mockImplementation(() => new Promise<MeetingType[]>(() => {}));
    renderAt("/book/call-45");

    expect(
      screen.getByRole("heading", { name: "Запись на встречу" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Звонок на 45 минут/)).toBeNull();
    expect(
      screen.queryByText("Бронирование будет реализовано на следующем этапе."),
    ).toBeNull();
  });

  it("сообщает, что бронирование будет на следующем этапе", async () => {
    renderAt("/book/call-45");

    expect(
      await screen.findByText(
        "Бронирование будет реализовано на следующем этапе.",
      ),
    ).toBeInTheDocument();
  });

  it("ведёт назад ко всем типам встреч", async () => {
    renderAt("/book/call-45");

    expect(
      await screen.findByRole("link", { name: "Ко всем типам встреч" }),
    ).toHaveAttribute("href", "/");
  });

  it("для неизвестного типа показывает только заглушку", async () => {
    renderAt("/book/unknown");

    expect(
      await screen.findByText(
        "Бронирование будет реализовано на следующем этапе.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Звонок на 45 минут/)).toBeNull();
  });

  it("при ошибке API показывает только заглушку", async () => {
    loadMock.mockRejectedValue(new Error("сеть недоступна"));
    renderAt("/book/call-45");

    expect(
      await screen.findByText(
        "Бронирование будет реализовано на следующем этапе.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Звонок на 45 минут/)).toBeNull();
  });
});
