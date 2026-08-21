import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { config } from "dotenv";
import * as Effect from "effect/Effect";

config({ path: "./.env" });

const LOCAL_WEB_PORT = 3011;
const LOCAL_SERVER_PORT = 3010;
const LOCAL_MCP_PORT = 3012;
const PRODUCTION_STAGE = "production";
const PUBLIC_HOSTNAME = "tacos.burio16.com";

const requiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
};

const stackRuntime = Effect.gen(function* () {
  const { stage } = yield* Alchemy.Stack;
  const isDev = yield* Alchemy.ALCHEMY_DEV;
  return { stage, isDev };
}).pipe(Effect.orDie);

const loadAppEnvironment = (isDev: boolean) => {
  const appEnvFile = isDev ? ".env.local" : ".env";
  config({ path: `../../apps/web/${appEnvFile}`, override: isDev });
  config({ path: `../../apps/server/${appEnvFile}`, override: isDev });
  config({ path: `../../apps/mcp/${appEnvFile}`, override: isDev });
};

const physicalName = (id: string, stage: string) => `tacos-${id}-${stage}`;

// v1 and v2 derive physical names differently. Keeping the v1 names allows
// the first v2 production deploy to adopt the existing resources.
const database = Cloudflare.D1.Database(
  "database",
  Effect.gen(function* () {
    const { stage } = yield* stackRuntime;
    return {
      name: physicalName("database", stage),
      migrationsDir: "../../packages/db/src/migrations",
    };
  }),
).pipe(Alchemy.RemovalPolicy.retain());

const restaurantPhotos = Cloudflare.R2.Bucket(
  "restaurant-photos",
  Effect.gen(function* () {
    const { stage } = yield* stackRuntime;
    return { name: physicalName("restaurant-photos", stage) };
  }),
).pipe(Alchemy.RemovalPolicy.retain());

const web = Cloudflare.Website.Vite(
  "web",
  Effect.gen(function* () {
    const { stage, isDev } = yield* stackRuntime;
    loadAppEnvironment(isDev);
    return {
      name: physicalName("web", stage),
      rootDir: "../../apps/web",
      env: {
        VITE_SERVER_URL: requiredEnv("VITE_SERVER_URL"),
      },
      assets: {
        notFoundHandling: "single-page-application" as const,
      },
      domain: isDev ? undefined : PUBLIC_HOSTNAME,
      dev: {
        port: LOCAL_WEB_PORT,
        strictPort: true,
      },
    };
  }),
);

export const server = Cloudflare.Worker(
  "server",
  Effect.gen(function* () {
    const { stage, isDev } = yield* stackRuntime;
    loadAppEnvironment(isDev);
    return {
      name: physicalName("server", stage),
      main: "../../apps/server/src/index.ts",
      compatibility: {
        flags: ["nodejs_compat"],
      },
      env: {
        DB: database,
        PHOTOS: restaurantPhotos,
        ADMIN_ACCESS_BYPASS: isDev ? "true" : "false",
        ADMIN_EMAIL: isDev ? "" : requiredEnv("ADMIN_EMAIL"),
        CORS_ORIGIN: requiredEnv("CORS_ORIGIN"),
      },
      routes: [{ pattern: `${PUBLIC_HOSTNAME}/api*` }, { pattern: `${PUBLIC_HOSTNAME}/photos*` }],
      dev: {
        port: LOCAL_SERVER_PORT,
        strictPort: true,
      },
    };
  }),
);

export type ServerEnv = Cloudflare.InferEnv<typeof server>;

const mcp = Cloudflare.Worker(
  "mcp",
  Effect.gen(function* () {
    const { stage, isDev } = yield* stackRuntime;
    loadAppEnvironment(isDev);
    return {
      name: physicalName("mcp", stage),
      main: "../../apps/mcp/src/index.ts",
      compatibility: {
        flags: ["nodejs_compat"],
      },
      env: {
        DB: database,
        PHOTO_URL_BASE: isDev
          ? `http://localhost:${LOCAL_SERVER_PORT}`
          : `https://${PUBLIC_HOSTNAME}`,
      },
      routes: [{ pattern: `${PUBLIC_HOSTNAME}/mcp*` }],
      dev: {
        port: LOCAL_MCP_PORT,
        strictPort: true,
      },
    };
  }),
);

export default Alchemy.Stack(
  "tacos",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const { stage, isDev } = yield* stackRuntime;
    const webOutput = yield* web;
    const serverOutput = yield* server;
    const mcpOutput = yield* mcp;

    const adminAccessApplicationId =
      !isDev && stage === PRODUCTION_STAGE
        ? yield* Effect.gen(function* () {
            // One-time PIN is an account singleton. Omitting a display name
            // keeps an existing provider unchanged when it is adopted.
            const otp = yield* Cloudflare.Access.IdentityProvider("admin-otp", {
              type: "onetimepin",
            }).pipe(Alchemy.RemovalPolicy.retain());

            const adminOnly = yield* Cloudflare.Access.Policy("admin-only", {
              name: "Tacos admin only",
              decision: "allow",
              include: [{ email: { email: requiredEnv("ADMIN_EMAIL") } }],
            });

            const adminAccess = yield* Cloudflare.Access.Application("admin", {
              type: "self_hosted",
              name: "Tacos admin",
              domain: `${PUBLIC_HOSTNAME}/admin*`,
              destinations: [
                { type: "public", uri: `${PUBLIC_HOSTNAME}/admin*` },
                { type: "public", uri: `${PUBLIC_HOSTNAME}/api/admin*` },
              ],
              allowedIdps: [otp.identityProviderId],
              autoRedirectToIdentity: true,
              appLauncherVisible: false,
              sessionDuration: "24h",
              policies: [adminOnly.policyId],
            });
            return adminAccess.applicationId;
          })
        : undefined;

    return {
      webUrl: webOutput.url,
      serverUrl: serverOutput.url,
      mcpUrl: mcpOutput.url,
      adminAccessApplicationId,
    };
  }),
);
