# 管理画面の Cloudflare Access 設定

管理画面は `https://tacos.burio16.com/admin` です。住所検索は
`POST /api/admin/geocode`、登録は `POST /api/admin/restaurants`、削除は
`DELETE /api/admin/restaurants/:id` を使います。公開する地図、写真、MCP とは Access
アプリを分けず、同じ一つの self-hosted アプリに次の二つの public hostname を追加します。

- `tacos.burio16.com/admin*`
- `tacos.burio16.com/api/admin*`

## Allow policy

`Allow` の `Include` には **Emails** を使い、管理者本人のメールアドレスを一件だけ指定します。
`Everyone`、メールドメイン全体、`One-time PIN` だけの許可は使いません。認証に使う IdP は、本人が普段使うものだけを有効にします。

このメールアドレスと同じ値を、デプロイ時の `ADMIN_EMAIL` 環境変数に設定します。
`packages/infra/.env` に置き、値はコミットしません。ローカル開発では不要です。

```dotenv
# packages/infra/.env
ADMIN_EMAIL=you@example.com

# apps/web/.env
VITE_SERVER_URL=https://tacos.burio16.com

# apps/server/.env
CORS_ORIGIN=https://tacos.burio16.com
```

Worker は Access で認証済みの実行コンテキストからメールを読み、`ADMIN_EMAIL` と一致しない書き込みを 403 で拒否します。そのため、Access の経路設定が外れた場合も登録 API は fail closed です。

## ローカル開発

`alchemy dev` では、デプロイ用の `.env` とは別にローカル専用の binding を読みます。
同時に別プロジェクトを起動してもポートがずれないよう、Tacos は次の固定ポートを使います。

- API: `http://localhost:3010`
- Web: `http://localhost:3011`
- MCP: `http://localhost:3012`

ローカル用の接続先は、コミットしない次のファイルで定義します。

```dotenv
# apps/web/.env.local
VITE_SERVER_URL=http://localhost:3010

# apps/server/.env.local
CORS_ORIGIN=http://localhost:3011
```

`alchemy dev` は `ADMIN_ACCESS_BYPASS=true` をローカル Worker にだけ注入するため、`http://localhost:3011/admin` では Cloudflare Access と `ADMIN_EMAIL` なしで登録できます。この値はリクエストから変更できず、デプロイ時は必ず `false` になります。

## 確認項目

- ローカルでは Access なしで `/admin` から登録できること。
- 本人のメールで `/admin` を開き、住所検索、登録、削除が成功すること。
- 別メール、または未認証状態で `/admin` と `/api/admin/restaurants` が Access により拒否されること。
- デプロイ環境で Access を通らないリクエストは、登録 API が 403 になること。
- `/`、`/api/restaurants`、`/photos/:restaurantId`、`/mcp` は公開のままであること。

Cloudflare Access は self-hosted アプリのパスを保護でき、複数の public hostname を一つのアプリにまとめられます。詳細は [Application paths](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/) と [Cloudflare Access for Workers](https://developers.cloudflare.com/workers/configuration/cloudflare-access/) を参照してください。
