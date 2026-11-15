import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PublicPage from "./PublicPage";
import { DEMO_MEETING_TYPES, fetchMeetingTypes } from "../data/meetingTypes";
import type { MeetingType } from "../data/meetingTypes";
import { renderWithProviders } from "../test/renderWithProviders";

vi.mock("../data/meetingTypes", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../data/meetingTypes")>();
  return { ...actual, fetchMeetingTypes: vi.fn() };
});

const fetchMock = vi.mocked(fetchMeetingTypes);

function renderPage() {
  return renderWithProviders(<PublicPage />);
}

beforeEach(() => {
  fetchMock.mockReset();
});

describe("публичная страница", () => {
  it("показывает имя владельца заголовком и меняет title документа", () => {
    fetchMock.mockResolvedValue(DEMO_MEETING_TYPES);
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Алексей Иванов" }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Алексей Иванов - запись на встречу");
  });

  it("показывает карточки типов с описанием и длительностью", async () => {
    fetchMock.mockResolvedValue(DEMO_MEETING_TYPES);
    renderPage();

    expect(
      await screen.findByText(
        "Созвон для обсуждения проекта. Подготовьте вопросы заранее.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("20 минут")).toBeInTheDocument();
    expect(screen.getByText("45 минут")).toBeInTheDocument();
  });

  it("карточка типа ведёт на страницу записи этого типа", async () => {
    fetchMock.mockResolvedValue(DEMO_MEETING_TYPES);
    renderPage();

    const link = await screen.findByRole("link", {
      name: /Звонок на 45 минут/,
    });

    expect(link).toHaveAttribute("href", "/book/call-45");
  });

  it("рендерит типы в порядке источника данных, не пересортировывая", async () => {
    fetchMock.mockResolvedValue(DEMO_MEETING_TYPES);
    renderPage();

    const links = await screen.findAllByRole("link");

    expect(links[0]).toHaveTextContent(DEMO_MEETING_TYPES[0].title);
    expect(links[1]).toHaveTextContent(DEMO_MEETING_TYPES[1].title);
  });

  it("без типов показывает пустое состояние", async () => {
    fetchMock.mockResolvedValue([]);
    renderPage();

    expect(
      await screen.findByText("Пока нет доступных типов встреч"),
    ).toBeInTheDocument();
  });

  it("во время загрузки не показывает ни список, ни состояния", () => {
    fetchMock.mockImplementation(() => new Promise<MeetingType[]>(() => {}));
    renderPage();

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByText("Пока нет доступных типов встреч")).toBeNull();
    expect(screen.queryByText("Не удалось загрузить типы встреч")).toBeNull();
  });

  it("при ошибке загрузки предлагает повторить и загружает снова", async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValueOnce(new Error("сеть недоступна"));
    fetchMock.mockResolvedValueOnce(DEMO_MEETING_TYPES);
    renderPage();

    expect(
      await screen.findByText("Не удалось загрузить типы встреч"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Повторить" }));

    expect(
      await screen.findByRole("link", { name: /Вводный звонок/ }),
    ).toBeInTheDocument();
  });
});
