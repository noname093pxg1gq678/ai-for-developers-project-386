import { describe, expect, it } from "vitest";
import { DEMO_MEETING_TYPES, fetchMeetingTypes } from "./meetingTypes";

describe("fetchMeetingTypes", () => {
  it("возвращает типы по времени создания, новые сверху", async () => {
    const types = await fetchMeetingTypes();

    expect(types[0].id).toBe("intro-call");
    expect(types[1].id).toBe("call-45");
  });

  it("возвращает копии, а не сами объекты списка", async () => {
    const types = await fetchMeetingTypes();

    expect(types[0]).not.toBe(DEMO_MEETING_TYPES[0]);
  });
});
