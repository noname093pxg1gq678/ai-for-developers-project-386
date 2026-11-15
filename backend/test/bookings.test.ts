import type { FastifyInstance } from "fastify";
import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { resetStore } from "../src/store.js";

// Бронирование слота гостем через API (issue #12, шов 1 - HTTP inject).
// Времена берутся в далёком будущем - окно записи и предстоящие встречи
// детерминированы без инъекции времени.

describe("бронирование слота через API", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    resetStore();
    app = await buildApp({ logger: false });
  });

  async function createType(durationMinutes: number): Promise<string> {
    const created = await app.inject({
      method: "POST",
      url: "/api/meeting-types",
      payload: {
        title: "Звонок на 45 минут",
        description: "Созвон для обсуждения проекта",
        durationMinutes,
      },
    });
    return created.json().id;
  }

  it("успешная бронь отвечает 201 с данными встречи: id, тип, название типа, время, гость", async () => {
    const typeId = await createType(45);

    const response = await app.inject({
      method: "POST",
      url: "/api/bookings",
      payload: {
        typeId,
        startsAt: "2099-01-01T10:00:00Z",
        guestName: "Мария Петрова",
        guestEmail: "maria@example.com",
        comment: "Хочу обсудить проект",
      },
    });

    expect(response.statusCode).toBe(201);
    const meeting = response.json();
    expect(meeting.typeId).toBe(typeId);
    expect(meeting.typeTitle).toBe("Звонок на 45 минут");
    expect(meeting.startsAt).toBe("2099-01-01T10:00:00.000Z");
    expect(meeting.guestName).toBe("Мария Петрова");
    expect(meeting.guestEmail).toBe("maria@example.com");
    expect(meeting.comment).toBe("Хочу обсудить проект");
    expect(meeting.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("бронь появляется в предстоящих встречах владельца", async () => {
    const typeId = await createType(45);
    await app.inject({
      method: "POST",
      url: "/api/bookings",
      payload: {
        typeId,
        startsAt: "2099-01-01T10:00:00Z",
        guestName: "Мария Петрова",
        guestEmail: "maria@example.com",
      },
    });

    const list = await app.inject({ method: "GET", url: "/api/meetings" });

    expect(list.statusCode).toBe(200);
    const meetings = list.json();
    expect(meetings).toHaveLength(1);
    expect(meetings[0].typeTitle).toBe("Звонок на 45 минут");
    expect(meetings[0].startsAt).toBe("2099-01-01T10:00:00.000Z");
    expect(meetings[0].guestName).toBe("Мария Петрова");
  });
});
