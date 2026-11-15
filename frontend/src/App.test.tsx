import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("маршруты приложения", () => {
  it("показывает публичную страницу в корне", async () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Алексей Иванов" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: /Звонок на 45 минут/ }),
    ).toBeInTheDocument();
  });

  it("карточка типа ведёт на страницу записи", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      await screen.findByRole("link", { name: /Звонок на 45 минут/ }),
    );

    expect(
      screen.getByRole("heading", { name: "Запись на встречу" }),
    ).toBeInTheDocument();
  });
});
