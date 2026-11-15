import { describe, expect, it } from "vitest";
import { formatDuration } from "./format";

describe("formatDuration", () => {
  it.each([
    [1, "1 минута"],
    [2, "2 минуты"],
    [5, "5 минут"],
    [11, "11 минут"],
    [15, "15 минут"],
    [20, "20 минут"],
    [21, "21 минута"],
    [22, "22 минуты"],
    [25, "25 минут"],
    [45, "45 минут"],
  ])("форматирует %i минут как «%s»", (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });
});
