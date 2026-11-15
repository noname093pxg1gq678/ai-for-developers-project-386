import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import BookingPage from "./BookingPage";
import { renderWithProviders } from "../test/renderWithProviders";

function renderAt(url: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/book/:typeId" element={<BookingPage />} />
    </Routes>,
    url,
  );
}

describe("заглушка страницы записи", () => {
  it("показывает заголовок, тип встречи и длительность", () => {
    renderAt("/book/call-45");

    expect(
      screen.getByRole("heading", { name: "Запись на встречу" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Звонок на 45 минут - 45 минут"),
    ).toBeInTheDocument();
  });

  it("сообщает, что бронирование будет на следующем этапе", () => {
    renderAt("/book/call-45");

    expect(
      screen.getByText("Бронирование будет реализовано на следующем этапе."),
    ).toBeInTheDocument();
  });

  it("ведёт назад ко всем типам встреч", () => {
    renderAt("/book/call-45");

    expect(
      screen.getByRole("link", { name: "Ко всем типам встреч" }),
    ).toHaveAttribute("href", "/");
  });

  it("для неизвестного типа показывает только заглушку", () => {
    renderAt("/book/unknown");

    expect(
      screen.getByRole("heading", { name: "Запись на встречу" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Звонок на 45 минут/)).toBeNull();
  });
});
