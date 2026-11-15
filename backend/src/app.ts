import Fastify, { type FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";

export interface AppOptions {
  logger?: boolean;
  /** Корень собранного фронтенда: раздаёт статику со SPA-fallback. */
  staticRoot?: string;
}

const health = () => ({ app: "call-booking-api", status: "ok" });

export async function buildApp(
  options: AppOptions = {},
): Promise<FastifyInstance> {
  const app = Fastify({ logger: options.logger ?? true });

  app.get("/api/health", async () => health());

  if (options.staticRoot) {
    await app.register(fastifyStatic, { root: options.staticRoot });
    // SPA-fallback: неизвестные пути отдают index.html - клиентский роутер
    // сам разрулит /admin и /book/*; API отвечает обычным 404 JSON-ом.
    app.setNotFoundHandler((request, reply) => {
      if (request.method === "GET" && !request.url.startsWith("/api")) {
        return reply.sendFile("index.html");
      }
      return reply.code(404).send({ message: "Not found" });
    });
  } else {
    app.get("/", async () => health());
  }

  return app;
}
