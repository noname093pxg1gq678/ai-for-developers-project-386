import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("дымовой тест приложения", () => {
  it("отвечает на GET / через inject", async () => {
    const app = await buildApp({ logger: false });

    const res = await app.inject({ method: "GET", url: "/" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ app: "call-booking-api", status: "ok" });
    await app.close();
  });

  it("поднимает сервер и отвечает по HTTP", async () => {
    const app = await buildApp({ logger: false });
    const address = await app.listen({ port: 0, host: "127.0.0.1" });

    const res = await fetch(address);
    const body = (await res.json()) as { status: string };

    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    await app.close();
  });
});
