import alchemy, { Scope } from "alchemy";
import { D1Database, R2Bucket, Vite, Worker } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });

const app = await alchemy("tacos");
const useLocalBindings = Scope.current.local;
const appEnvFile = useLocalBindings ? ".env.local" : ".env";
const adminEmail = useLocalBindings ? "" : alchemy.env.ADMIN_EMAIL!;

config({ path: `../../apps/web/${appEnvFile}`, override: useLocalBindings });
config({ path: `../../apps/server/${appEnvFile}`, override: useLocalBindings });

const LOCAL_SERVER_PORT = 3010;
const LOCAL_MCP_PORT = 3012;

// `alchemy dev` applies this migration chain to the local Miniflare D1 database.
const db = await D1Database("database", {
  migrationsDir: "../../packages/db/src/migrations",
});

const restaurantPhotos = await R2Bucket("restaurant-photos", {
  delete: false,
});

export const web = await Vite("web", {
  cwd: "../../apps/web",
  assets: "dist",
  spa: true,
  bindings: {
    VITE_SERVER_URL: alchemy.env.VITE_SERVER_URL!,
  },
  ...(useLocalBindings ? { routes: ["tacos.burio16.com/*"] } : { domains: ["tacos.burio16.com"] }),
});

export const server = await Worker("server", {
  cwd: "../../apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  bindings: {
    DB: db,
    PHOTOS: restaurantPhotos,
    ADMIN_ACCESS_BYPASS: useLocalBindings ? "true" : "false",
    ADMIN_EMAIL: adminEmail,
    CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
  },
  routes: ["tacos.burio16.com/api*", "tacos.burio16.com/photos*"],
  dev: {
    port: LOCAL_SERVER_PORT,
  },
});

export const mcp = await Worker("mcp", {
  cwd: "../../apps/mcp",
  entrypoint: "src/index.ts",
  compatibility: "node",
  bindings: {
    DB: db,
    PHOTO_URL_BASE: useLocalBindings
      ? `http://localhost:${LOCAL_SERVER_PORT}`
      : "https://tacos.burio16.com",
  },
  routes: ["tacos.burio16.com/mcp*"],
  dev: {
    port: LOCAL_MCP_PORT,
  },
});

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);
console.log(`MCP    -> ${mcp.url}`);

await app.finalize();
