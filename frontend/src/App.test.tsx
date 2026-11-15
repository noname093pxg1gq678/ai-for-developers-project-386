import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("дымовой тест приложения", () => {
  it("показывает заголовок приложения", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Календарь звонков" }),
    ).toBeInTheDocument();
  });
});
