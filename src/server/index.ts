import "dotenv/config";

import { buildApp } from "@server/app";
import { loadEnv } from "@server/config/env";

const env = loadEnv();
const app = buildApp(env);

const shutdown = async (signal: string) => {
  app.log.info({ signal }, "shutting down");
  await app.close();
  process.exit(0);
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({
    host: env.HOST,
    port: env.PORT,
  });
} catch (error) {
  app.log.fatal(error);
  process.exit(1);
}
