import type { FastifyPluginAsync } from "fastify";

import type { HealthResponse } from "@shared/contracts/health";

interface HealthRoutesOptions {
  version: string;
}

export const healthRoutes: FastifyPluginAsync<HealthRoutesOptions> = async (
  app,
  options,
) => {
  app.get<{ Reply: HealthResponse }>("/health", async () => ({
    status: "ok",
    service: "sumi-ufcg",
    version: options.version,
    timestamp: new Date().toISOString(),
  }));
};
