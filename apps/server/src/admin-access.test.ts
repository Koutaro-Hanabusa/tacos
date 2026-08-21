import { Hono } from "hono";
import { describe, expect, it } from "vite-plus/test";
import { requireAdminAccess } from "./admin-access";

type AccessExecutionContext = ExecutionContext & {
  access?: {
    getIdentity: () => Promise<unknown>;
  };
};

function executionContext(email?: string): AccessExecutionContext {
  return {
    waitUntil: () => {},
    passThroughOnException: () => {},
    props: undefined,
    ...(email ? { access: { getIdentity: async () => ({ email }) } } : {}),
  };
}

function protectedApp() {
  const app = new Hono<{
    Bindings: { ADMIN_ACCESS_BYPASS: string; ADMIN_EMAIL: string };
  }>();
  app.use("/*", requireAdminAccess);
  app.post("/", (c) => c.text("ok"));
  return app;
}

const productionBindings = {
  ADMIN_ACCESS_BYPASS: "false",
  ADMIN_EMAIL: "owner@example.com",
};

describe("requireAdminAccess", () => {
  it("Access を通っていない書き込みを拒否する", async () => {
    const response = await protectedApp().request(
      "http://localhost/",
      { method: "POST" },
      productionBindings,
      executionContext(),
    );

    expect(response.status).toBe(403);
  });

  it("一致する Access メールだけを書き込み可能にする", async () => {
    const response = await protectedApp().request(
      "http://localhost/",
      { method: "POST" },
      productionBindings,
      executionContext("owner@example.com"),
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("ok");
  });

  it("ローカル binding では Access と管理者メールなしで書き込み可能にする", async () => {
    const response = await protectedApp().request(
      "http://localhost/",
      { method: "POST" },
      { ADMIN_ACCESS_BYPASS: "true", ADMIN_EMAIL: "" },
      executionContext(),
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("ok");
  });
});
