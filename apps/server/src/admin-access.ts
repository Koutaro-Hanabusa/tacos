import type { MiddlewareHandler } from "hono";

type AccessExecutionContext = ExecutionContext & {
  access?: {
    getIdentity: () => Promise<unknown>;
  };
};

type AdminBindings = {
  ADMIN_ACCESS_BYPASS: string;
  ADMIN_EMAIL: string;
};

function accessEmail(identity: unknown) {
  if (typeof identity !== "object" || identity === null) return null;

  const email = (identity as { email?: unknown }).email;
  return typeof email === "string" ? email : null;
}

export const requireAdminAccess: MiddlewareHandler<{
  Bindings: AdminBindings;
}> = async (c, next) => {
  if (c.env.ADMIN_ACCESS_BYPASS === "true") {
    await next();
    return;
  }

  const configuredEmail = c.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!configuredEmail) {
    return c.json({ error: "管理者メールアドレスが未設定です。" }, 503);
  }

  const access = (c.executionCtx as AccessExecutionContext).access;
  if (!access) {
    return c.json({ error: "Cloudflare Access での認証が必要です。" }, 403);
  }

  try {
    const email = accessEmail(await access.getIdentity())
      ?.trim()
      .toLowerCase();
    if (email !== configuredEmail) {
      return c.json({ error: "この操作を行う権限がありません。" }, 403);
    }
  } catch {
    return c.json({ error: "Cloudflare Access の認証情報を確認できません。" }, 403);
  }

  await next();
};
