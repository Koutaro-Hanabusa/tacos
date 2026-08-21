export const RESTAURANT_APP_RESOURCE_URI = "ui://tacos/restaurant-browser.html";

export const restaurantAppHtml = String.raw`<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tacos restaurant browser</title>
    <style>
      :root {
        color-scheme: light dark;
        --paper: #fff6e6;
        --surface: #fffdf9;
        --ink: #2e1b13;
        --muted: #765f51;
        --line: #e8d3b3;
        --chile: #d94b2b;
        --maize: #f2b53b;
        --cactus: #28715e;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --paper: #231711;
          --surface: #302018;
          --ink: #fff2df;
          --muted: #d8bda7;
          --line: #624334;
          --chile: #ff7755;
          --maize: #fac94f;
          --cactus: #7ec7aa;
        }
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: radial-gradient(circle at right top, color-mix(in srgb, var(--maize) 25%, transparent), transparent 28%), var(--paper);
        color: var(--ink);
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif;
      }
      main { max-width: 960px; margin: 0 auto; padding: 18px; }
      .eyebrow { color: var(--chile); font-size: .72rem; font-weight: 800; letter-spacing: .14em; margin: 0 0 5px; text-transform: uppercase; }
      h1 { font-family: "Iowan Old Style", "Palatino Linotype", serif; font-size: clamp(1.55rem, 5vw, 2.35rem); letter-spacing: -.045em; line-height: 1; margin: 0; }
      .lead, #status { color: var(--muted); font-size: .86rem; margin: 9px 0 0; }
      form { align-items: end; background: var(--surface); border: 1px solid var(--line); box-shadow: 0 12px 30px rgba(90, 45, 20, .1); display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)) auto; margin: 20px 0 14px; padding: 12px; }
      label { color: var(--muted); display: grid; font-size: .72rem; font-weight: 700; gap: 5px; }
      input { background: var(--paper); border: 1px solid var(--line); color: var(--ink); font: inherit; min-width: 0; padding: 9px 10px; }
      button { background: var(--chile); border: 1px solid var(--chile); color: white; cursor: pointer; font: inherit; font-size: .82rem; font-weight: 800; min-height: 37px; padding: 0 14px; }
      button:hover { filter: brightness(.9); }
      button:disabled { cursor: wait; opacity: .65; }
      input:focus-visible, button:focus-visible, a:focus-visible { outline: 3px solid color-mix(in srgb, var(--maize) 70%, transparent); outline-offset: 2px; }
      .toolbar { align-items: center; display: flex; gap: 10px; justify-content: space-between; margin: 10px 0 14px; }
      #count { font-family: "Iowan Old Style", "Palatino Linotype", serif; font-size: 1.08rem; font-weight: 700; }
      #refresh { background: transparent; border-color: var(--line); color: var(--ink); }
      #results { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
      .card { background: var(--surface); border: 1px solid var(--line); display: grid; gap: 10px; min-height: 152px; overflow: hidden; padding: 14px; }
      .card-header { align-items: start; display: flex; gap: 10px; justify-content: space-between; }
      h2 { font-family: "Iowan Old Style", "Palatino Linotype", serif; font-size: 1.18rem; line-height: 1.12; margin: 0; }
      .photo { aspect-ratio: 16 / 9; border: 1px solid var(--line); object-fit: cover; width: 100%; }
      .address { color: var(--muted); font-size: .78rem; line-height: 1.45; margin: 0; }
      .maps { align-self: end; color: var(--chile); font-size: .78rem; font-weight: 800; text-underline-offset: 3px; }
      .empty { border: 1px dashed var(--line); color: var(--muted); grid-column: 1 / -1; padding: 24px; text-align: center; }
      @media (max-width: 680px) { form { grid-template-columns: 1fr 1fr; } form button { grid-column: span 2; } }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Tacos pocket guide</p>
      <h1>次に行く店を、ここで決める。</h1>
      <p class="lead">会話で見つけた候補を、店名または住所で絞り込めます。</p>
      <form id="search-form">
        <label>名前<input id="name" autocomplete="off" placeholder="例: Taqueria" /></label>
        <label>住所<input id="address" autocomplete="off" placeholder="例: 渋谷区" /></label>
        <button id="search" type="submit">探す</button>
      </form>
      <div class="toolbar">
        <span id="count" aria-live="polite">結果を待っています</span>
        <button id="refresh" type="button">新着を表示</button>
      </div>
      <p id="status" role="status">MCP からレストラン情報を受け取ります。</p>
      <section id="results" aria-label="レストラン検索結果"></section>
    </main>
    <script type="module">
      import { App, PostMessageTransport, applyDocumentTheme, applyHostStyleVariables } from "https://esm.sh/@modelcontextprotocol/ext-apps@1.7.5";

      const nameInput = document.getElementById("name");
      const addressInput = document.getElementById("address");
      const form = document.getElementById("search-form");
      const searchButton = document.getElementById("search");
      const refreshButton = document.getElementById("refresh");
      const count = document.getElementById("count");
      const status = document.getElementById("status");
      const results = document.getElementById("results");
      const app = new App({ name: "Tacos restaurant browser", version: "0.1.0" });

      const text = (value) => value === null || value === undefined ? "" : String(value);

      function resultPayload(result) {
        if (result?.structuredContent) return result.structuredContent;
        const value = result?.content?.find((item) => item.type === "text")?.text;
        try {
          const parsed = JSON.parse(value || "[]");
          return Array.isArray(parsed) ? { restaurants: parsed } : parsed;
        } catch {
          return { restaurants: [] };
        }
      }

      function card(restaurant) {
        const element = document.createElement("article");
        element.className = "card";
        const header = document.createElement("div");
        header.className = "card-header";
        const title = document.createElement("h2");
        title.textContent = text(restaurant.name) || "名前のないレストラン";
        header.append(title);
        element.append(header);
        if (restaurant.photoUrl) {
          try {
            const photo = document.createElement("img");
            photo.className = "photo";
            photo.alt = text(restaurant.name) + "の写真";
            photo.loading = "lazy";
            photo.src = new URL(text(restaurant.photoUrl)).toString();
            element.append(photo);
          } catch {}
        }
        if (restaurant.address) {
          const address = document.createElement("p");
          address.className = "address";
          address.textContent = text(restaurant.address);
          element.append(address);
        }
        if (restaurant.googleMapsUrl) {
          try {
            const maps = document.createElement("a");
            maps.className = "maps";
            maps.href = new URL(text(restaurant.googleMapsUrl)).toString();
            maps.rel = "noopener noreferrer";
            maps.target = "_blank";
            maps.textContent = "地図を開く →";
            element.append(maps);
          } catch {}
        }
        return element;
      }

      function render(payload) {
        const restaurants = Array.isArray(payload?.restaurants) ? payload.restaurants : [];
        results.replaceChildren();
        count.textContent = restaurants.length + " 件のレストラン";
        if (!restaurants.length) {
          const empty = document.createElement("p");
          empty.className = "empty";
          empty.textContent = "条件に合う店はまだありません。検索条件を変えてみてください。";
          results.append(empty);
          return;
        }
        restaurants.forEach((restaurant) => results.append(card(restaurant)));
      }

      function searchArguments() {
        const args = {};
        if (nameInput.value.trim()) args.name = nameInput.value.trim();
        if (addressInput.value.trim()) args.address = addressInput.value.trim();
        return args;
      }

      async function callTool(name, argumentsValue, message) {
        searchButton.disabled = true;
        refreshButton.disabled = true;
        status.textContent = message;
        try {
          const result = await app.callServerTool({ name, arguments: argumentsValue });
          render(resultPayload(result));
          status.textContent = "更新しました。";
        } catch (error) {
          status.textContent = "取得に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー");
        } finally {
          searchButton.disabled = false;
          refreshButton.disabled = false;
        }
      }

      app.ontoolinput = (params) => {
        const args = params.arguments || {};
        if (typeof args.name === "string") nameInput.value = args.name;
        if (typeof args.address === "string") addressInput.value = args.address;
        status.textContent = "検索しています…";
      };
      app.ontoolresult = (result) => {
        render(resultPayload(result));
        status.textContent = "検索結果を表示しています。";
      };
      app.onhostcontextchanged = (context) => {
        if (context.theme) applyDocumentTheme(context.theme);
        if (context.styles?.variables) applyHostStyleVariables(context.styles.variables);
      };
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        void callTool("restaurant_search", searchArguments(), "検索しています…");
      });
      refreshButton.addEventListener("click", () => {
        void callTool("restaurant_list", { limit: 50 }, "新着の店を読み込んでいます…");
      });
      try {
        await app.connect(new PostMessageTransport());
      } catch (error) {
        status.textContent = "MCP App への接続に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー");
      }
    </script>
  </body>
</html>`;
