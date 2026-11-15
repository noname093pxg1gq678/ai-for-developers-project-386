import type { FastifyInstance } from "fastify";
import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { resetStore, seedMeeting } from "../src/store.js";

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

  it("ошибки валидации отвечают 400 без создания встречи", async () => {
    const typeId = await createType(45);
    const invalidPayloads = [
      {
        typeId,
        startsAt: "2099-01-01T10:00:00Z",
        guestName: "",
        guestEmail: "maria@example.com",
      },
      {
        typeId,
        startsAt: "2099-01-01T10:00:00Z",
        guestName: "и".repeat(101),
        guestEmail: "maria@example.com",
      },
      {
        typeId,
        startsAt: "2099-01-01T10:00:00Z",
        guestName: "Мария",
        guestEmail: "не-почта",
      },
      { typeId, startsAt: "2099-01-01T10:00:00Z", guestName: "Мария" },
      {
        typeId,
        startsAt: "2099-01-01T10:00:00Z",
        guestName: "Мария",
        guestEmail: "maria@example.com",
        comment: "к".repeat(501),
      },
      {
        typeId,
        startsAt: "не-момент",
        guestName: "Мария",
        guestEmail: "maria@example.com",
      },
      {
        startsAt: "2099-01-01T10:00:00Z",
        guestName: "Мария",
        guestEmail: "maria@example.com",
      },
    ];

    for (const payload of invalidPayloads) {
      const response = await app.inject({
        method: "POST",
        url: "/api/bookings",
        payload,
      });
      expect(response.statusCode, JSON.stringify(payload)).toBe(400);
      expect(response.json().message).toEqual(expect.any(String));
    }

    const list = await app.inject({ method: "GET", url: "/api/meetings" });
    expect(list.json()).toEqual([]);
  });

  it("неизвестный тип встречи отвечает 404", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/bookings",
      payload: {
        typeId: "unknown-id",
        startsAt: "2099-01-01T10:00:00Z",
        guestName: "Мария Петрова",
        guestEmail: "maria@example.com",
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().message).toEqual(expect.any(String));
  });

  it("пересечение с существующей встречей отвечает 409 и слот исчезает из свободных", async () => {
    const typeId = await createType(30);
    const busyTypeId = await createType(45);
    // Существующая встреча 10:45-11:30 по поясу владельца.
    seedMeeting({
      id: crypto.randomUUID(),
      typeId: busyTypeId,
      startsAt: "2099-01-01T07:45:00Z",
      guestName: "Анна Кузнецова",
      guestEmail: "anna@example.com",
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/bookings",
      payload: {
        typeId,
        startsAt: "2099-01-01T08:00:00Z",
        guestName: "Мария Петрова",
        guestEmail: "maria@example.com",
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().message).toEqual(expect.any(String));

    const slots = await app.inject({
      method: "GET",
      url: `/api/meeting-types/${typeId}/slots`,
    });
    expect(slots.json<string[]>()).not.toContain("2099-01-01T08:00:00.000Z");
  });

  it("встреча вплотную к существующей разрешена: 201", async () => {
    const typeId = await createType(30);
    const busyTypeId = await createType(45);
    // Существующая встреча 10:45-11:30 по поясу владельца: бронь в 11:30
    // прилегает вплотную к её концу.
    seedMeeting({
      id: crypto.randomUUID(),
      typeId: busyTypeId,
      startsAt: "2099-01-01T07:45:00Z",
      guestName: "Анна Кузнецова",
      guestEmail: "anna@example.com",
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/bookings",
      payload: {
        typeId,
        startsAt: "2099-01-01T08:30:00Z",
        guestName: "Мария Петрова",
        guestEmail: "maria@example.com",
      },
    });

    expect(response.statusCode).toBe(201);
  });
});
