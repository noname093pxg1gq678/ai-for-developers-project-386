import type { FastifyInstance } from "fastify";
import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { resetStore, seedMeeting } from "../src/store.js";

describe("предстоящие встречи через API", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    resetStore();
    app = await buildApp({ logger: false });
  });

  it("без встреч отдаёт пустой список", async () => {
    const list = await app.inject({ method: "GET", url: "/api/meetings" });

    expect(list.statusCode).toBe(200);
    expect(list.json()).toEqual([]);
  });

  it("отдаёт предстоящие встречи по возрастанию времени начала, прошедшие исключены", async () => {
    seedMeeting({
      id: "later",
      typeId: "type-1",
      typeTitle: "Звонок на 45 минут",
      startsAt: "2099-01-02T10:00:00Z",
      guestName: "Мария Петрова",
      guestEmail: "maria@example.com",
      comment: "Хочу обсудить проект",
    });
    seedMeeting({
      id: "past",
      typeId: "type-1",
      typeTitle: "Звонок на 45 минут",
      startsAt: "2020-01-01T09:00:00Z",
      guestName: "Иван Смирнов",
      guestEmail: "ivan@example.com",
    });
    seedMeeting({
      id: "earlier",
      typeId: "type-2",
      typeTitle: "Вводный звонок",
      startsAt: "2099-01-01T09:00:00Z",
      guestName: "Анна Кузнецова",
      guestEmail: "anna@example.com",
    });

    const list = await app.inject({ method: "GET", url: "/api/meetings" });

    expect(list.statusCode).toBe(200);
    expect(list.json().map((meeting: { id: string }) => meeting.id)).toEqual([
      "earlier",
      "later",
    ]);
  });
});
