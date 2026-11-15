import Fastify, { type FastifyInstance } from "fastify";

export interface AppOptions {
  logger?: boolean;
}

export async function buildApp(
  options: AppOptions = {},
): Promise<FastifyInstance> {
  const app = Fastify({ logger: options.logger ?? true });

  app.get("/", async () => {
    return { app: "call-booking-api", status: "ok" };
  });

  return app;
}
