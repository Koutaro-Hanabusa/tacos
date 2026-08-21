import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as GitHub from "alchemy/GitHub";
import { config } from "dotenv";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

const GITHUB_OWNER = "Koutaro-Hanabusa";
const GITHUB_REPOSITORY = "tacos";

const requiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
};

export default Alchemy.Stack(
  "tacos-ci",
  {
    providers: Layer.mergeAll(Cloudflare.providers(), GitHub.providers()),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const { accountId } = yield* yield* Cloudflare.CloudflareEnvironment;
    const zone = yield* Cloudflare.Zone.findZoneByName({
      accountId,
      name: "burio16.com",
    }).pipe(Effect.orDie);
    if (!zone) {
      return yield* Effect.die("Cloudflare zone burio16.com was not found");
    }
    const accessAppsWrite = Cloudflare.ApiToken.PERMISSION_GROUPS.find(
      (group) =>
        group.name === "Access: Apps and Policies Write" &&
        (group.scopes as readonly string[]).includes("com.cloudflare.api.account"),
    );
    if (!accessAppsWrite) {
      return yield* Effect.die("Account-scoped Access Apps and Policies permission was not found");
    }

    const ciToken = yield* Cloudflare.ApiToken.UserApiToken("ci-token", {
      name: "tacos-github-actions",
      policies: [
        {
          effect: "allow",
          permissionGroups: [
            "Secrets Store Write",
            "Workers Scripts Write",
            "Workers R2 Storage Write",
            "D1 Write",
            "Account Settings Read",
            // The name is shared by account- and zone-scoped groups. Use the
            // account-scoped ID because Access is managed at account level.
            { id: accessAppsWrite.id },
            "Access: Organizations, Identity Providers, and Groups Write",
          ],
          resources: {
            [`com.cloudflare.api.account.${accountId}`]: "*",
          },
        },
        {
          effect: "allow",
          permissionGroups: ["Workers Routes Write", "Zone Read"],
          resources: {
            [`com.cloudflare.api.account.${accountId}`]: {
              [`com.cloudflare.api.account.zone.${zone.id}`]: "*",
            },
          },
        },
      ],
    });

    const production = yield* GitHub.Environment("production", {
      owner: GITHUB_OWNER,
      repository: GITHUB_REPOSITORY,
      name: "production",
      deploymentBranchPolicy: { customBranchPolicies: ["main"] },
    });

    yield* GitHub.Secret("cloudflare-api-token", {
      owner: GITHUB_OWNER,
      repository: GITHUB_REPOSITORY,
      environment: production,
      name: "CLOUDFLARE_API_TOKEN",
      value: ciToken.value,
    });

    yield* GitHub.Secret("cloudflare-account-id", {
      owner: GITHUB_OWNER,
      repository: GITHUB_REPOSITORY,
      environment: production,
      name: "CLOUDFLARE_ACCOUNT_ID",
      value: Redacted.make(accountId),
    });

    yield* GitHub.Secret("admin-email", {
      owner: GITHUB_OWNER,
      repository: GITHUB_REPOSITORY,
      environment: production,
      name: "ADMIN_EMAIL",
      value: Redacted.make(requiredEnv("ADMIN_EMAIL")),
    });

    yield* GitHub.Variable("vite-server-url", {
      owner: GITHUB_OWNER,
      repository: GITHUB_REPOSITORY,
      name: "VITE_SERVER_URL",
      value: requiredEnv("VITE_SERVER_URL"),
    });

    yield* GitHub.Variable("cors-origin", {
      owner: GITHUB_OWNER,
      repository: GITHUB_REPOSITORY,
      environment: production,
      name: "CORS_ORIGIN",
      value: requiredEnv("CORS_ORIGIN"),
    });

    return {
      ciTokenId: ciToken.tokenId,
      productionEnvironment: production.htmlUrl,
    };
  }),
);
