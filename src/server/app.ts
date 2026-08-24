import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyError, type FastifyInstance } from "fastify";

import { type AppEnv, loadEnv } from "@server/config/env";
import { healthRoutes } from "@server/modules/health/health.routes";

export function buildApp(overrides: Partial<AppEnv> = {}): FastifyInstance {
  const env = { ...loadEnv(), ...overrides };
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
    requestIdHeader: "x-request-id",
  });

  app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
  });

  if (env.WEB_ORIGIN) {
    app.register(cors, {
      origin: env.WEB_ORIGIN,
      credentials: true,
    });
  }

  app.register(healthRoutes, {
    prefix: "/api/v1",
    version: env.APP_VERSION,
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    request.log.error({ err: error }, "request failed");
    const statusCode = error.statusCode && error.statusCode >= 400
      ? error.statusCode
      : 500;

    reply.status(statusCode).send({
      error: statusCode === 500 ? "internal_server_error" : error.name,
      message: statusCode === 500 ? "Não foi possível concluir a solicitação." : error.message,
      requestId: request.id,
    });
  });

  if (env.NODE_ENV === "production") {
    const clientDirectory = fileURLToPath(new URL("../client/", import.meta.url));

    if (fs.existsSync(clientDirectory)) {
      app.register(fastifyStatic, {
        root: clientDirectory,
        prefix: "/",
      });

      app.setNotFoundHandler((request, reply) => {
        if (request.url.startsWith("/api/")) {
          return reply.status(404).send({
            error: "not_found",
            message: "Recurso não encontrado.",
            requestId: request.id,
          });
        }

        return reply.sendFile("index.html", path.resolve(clientDirectory));
      });
    }
  }

  return app;
}
