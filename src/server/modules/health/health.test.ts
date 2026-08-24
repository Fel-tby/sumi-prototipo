import { afterEach, describe, expect, it } from "vitest";

import { buildApp } from "@server/app";

describe("GET /api/v1/health", () => {
  const apps: ReturnType<typeof buildApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it("returns the application status", async () => {
    const app = buildApp({
      NODE_ENV: "test",
      HOST: "127.0.0.1",
      PORT: 3333,
      LOG_LEVEL: "silent",
      APP_VERSION: "0.1.0-test",
    });
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ok",
      service: "sumi-ufcg",
      version: "0.1.0-test",
    });
  });
});
