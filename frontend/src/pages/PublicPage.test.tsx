import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PublicPage from "./PublicPage";
import { fetchMeetingTypes } from "../data/meetingTypes";
import type { MeetingType } from "../data/meetingTypes";
import { renderWithProviders } from "../test/renderWithProviders";

vi.mock("../data/meetingTypes", () => ({
  DEMO_MEETING_TYPES: [],
  fetchMeetingTypes: vi.fn(),
}));

const fetchMock = vi.mocked(fetchMeetingTypes);

const testTypes: MeetingType[] = [
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

function renderPage() {
  return renderWithProviders(<PublicPage />);
}

beforeEach(() => {
  fetchMock.mockReset();
});

describe("публичная страница", () => {
  it("показывает имя владельца заголовком и меняет title документа", () => {
    fetchMock.mockResolvedValue(testTypes);
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Алексей Иванов" }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Алексей Иванов - запись на встречу");
  });

  it("показывает карточки типов с описанием и длительностью", async () => {
    fetchMock.mockResolvedValue(testTypes);
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
    fetchMock.mockResolvedValue(testTypes);
    renderPage();

    const link = await screen.findByRole("link", {
      name: /Звонок на 45 минут/,
    });

    expect(link).toHaveAttribute("href", "/book/call-45");
  });

  it("показывает типы по времени создания, новые сверху", async () => {
    fetchMock.mockResolvedValue(testTypes);
    renderPage();

    const links = await screen.findAllByRole("link");

    expect(links[0]).toHaveTextContent("Вводный звонок");
    expect(links[1]).toHaveTextContent("Звонок на 45 минут");
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
    fetchMock.mockResolvedValueOnce(testTypes);
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
