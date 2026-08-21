export const RESTAURANT_APP_RESOURCE_URI = "ui://tacos/restaurant-map-v1.html";

export const restaurantAppHtml = String.raw`<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tacos restaurant map</title>
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
        --shadow: rgba(90, 45, 20, .16);
      }
      @media (prefers-color-scheme: dark) {
        :root:not([data-theme="light"]) {
          --paper: #231711;
          --surface: #302018;
          --ink: #fff2df;
          --muted: #d8bda7;
          --line: #624334;
          --chile: #ff7755;
          --maize: #fac94f;
          --cactus: #7ec7aa;
          --shadow: rgba(0, 0, 0, .3);
        }
      }
      :root[data-theme="dark"] {
        --paper: #231711;
        --surface: #302018;
        --ink: #fff2df;
        --muted: #d8bda7;
        --line: #624334;
        --chile: #ff7755;
        --maize: #fac94f;
        --cactus: #7ec7aa;
        --shadow: rgba(0, 0, 0, .3);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: radial-gradient(circle at right top, color-mix(in srgb, var(--maize) 25%, transparent), transparent 28%), var(--paper);
        color: var(--ink);
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif;
      }
      main { max-width: 1080px; margin: 0 auto; padding: 18px; }
      .eyebrow { color: var(--chile); font-size: .72rem; font-weight: 800; letter-spacing: .14em; margin: 0 0 5px; text-transform: uppercase; }
      h1 { font-family: "Iowan Old Style", "Palatino Linotype", serif; font-size: clamp(1.55rem, 5vw, 2.35rem); letter-spacing: -.045em; line-height: 1; margin: 0; }
      .lead, #status { color: var(--muted); font-size: .86rem; margin: 9px 0 0; }
      form { align-items: end; background: var(--surface); border: 1px solid var(--line); box-shadow: 0 12px 30px var(--shadow); display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)) auto; margin: 20px 0 14px; padding: 12px; }
      label { color: var(--muted); display: grid; font-size: .72rem; font-weight: 700; gap: 5px; }
      input { background: var(--paper); border: 1px solid var(--line); color: var(--ink); font: inherit; min-width: 0; padding: 9px 10px; }
      button { background: var(--chile); border: 1px solid var(--chile); color: white; cursor: pointer; font: inherit; font-size: .82rem; font-weight: 800; min-height: 37px; padding: 0 14px; }
      button:hover { filter: brightness(.9); }
      button:disabled { cursor: wait; opacity: .65; }
      input:focus-visible, button:focus-visible, a:focus-visible { outline: 3px solid color-mix(in srgb, var(--maize) 70%, transparent); outline-offset: 2px; }
      .toolbar { align-items: center; display: flex; gap: 10px; justify-content: space-between; margin: 10px 0 12px; }
      #count { font-family: "Iowan Old Style", "Palatino Linotype", serif; font-size: 1.08rem; font-weight: 700; }
      #refresh { background: transparent; border-color: var(--line); color: var(--ink); }
      .map-shell { background: var(--surface); border: 1px solid var(--line); box-shadow: 0 14px 34px var(--shadow); display: grid; grid-template-columns: minmax(0, 1fr) 280px; min-height: 430px; overflow: hidden; }
      .map-wrap { min-height: 430px; position: relative; }
      #map { height: 100%; inset: 0; min-height: 430px; position: absolute; width: 100%; }
      #empty { align-items: center; background: color-mix(in srgb, var(--surface) 92%, transparent); color: var(--muted); display: none; inset: 0; justify-content: center; padding: 24px; position: absolute; text-align: center; z-index: 500; }
      #empty.visible { display: flex; }
      #detail { border-left: 1px solid var(--line); display: flex; flex-direction: column; min-width: 0; }
      .detail-empty { color: var(--muted); margin: auto; padding: 24px; text-align: center; }
      .photo { aspect-ratio: 4 / 3; object-fit: cover; width: 100%; }
      .detail-body { display: grid; gap: 13px; padding: 18px; }
      h2 { font-family: "Iowan Old Style", "Palatino Linotype", serif; font-size: 1.35rem; line-height: 1.12; margin: 0; }
      .address { color: var(--muted); font-size: .82rem; line-height: 1.55; margin: 0; }
      .coordinates { color: var(--muted); font-size: .7rem; margin: 0; }
      .maps { color: var(--chile); font-size: .82rem; font-weight: 800; text-underline-offset: 3px; }
      #places { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; padding: 2px 2px 8px; }
      .place { background: var(--surface); border-color: var(--line); color: var(--ink); max-width: 230px; overflow: hidden; text-align: left; text-overflow: ellipsis; white-space: nowrap; }
      .place[aria-pressed="true"] { background: var(--cactus); border-color: var(--cactus); color: white; }
      .taco-marker { align-items: center; background: var(--chile); border: 3px solid #fff8e9; border-radius: 50% 50% 50% 8px; box-shadow: 0 4px 12px rgba(58, 27, 13, .35); color: white; display: flex; font-size: 17px; height: 38px; justify-content: center; transform: rotate(-45deg); transition: transform .15s ease, background .15s ease; width: 38px; }
      .taco-marker span { transform: rotate(45deg); }
      .taco-marker.selected { background: var(--cactus); transform: rotate(-45deg) scale(1.18); }
      .leaflet-control-attribution { font-size: 9px !important; }
      .leaflet-control-zoom a { color: #2e1b13 !important; }
      @media (max-width: 720px) {
        form { grid-template-columns: 1fr 1fr; }
        form button { grid-column: span 2; }
        .map-shell { grid-template-columns: 1fr; }
        .map-wrap, #map { min-height: 360px; }
        #detail { border-left: 0; border-top: 1px solid var(--line); min-height: 150px; }
        .detail-card { display: grid; grid-template-columns: minmax(110px, 34%) 1fr; }
        .photo { height: 100%; min-height: 150px; }
      }
      @media (max-width: 430px) {
        main { padding: 14px; }
        form { grid-template-columns: 1fr; }
        form button { grid-column: auto; }
        .map-wrap, #map { min-height: 320px; }
      }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Tacos pocket guide</p>
      <h1>次に行く店を、地図で決める。</h1>
      <p class="lead">会話で見つけた候補を、場所と写真を見ながら選べます。</p>
      <form id="search-form">
        <label>名前<input id="name" autocomplete="off" placeholder="例: Taqueria" /></label>
        <label>住所<input id="address" autocomplete="off" placeholder="例: 中目黒" /></label>
        <button id="search" type="submit">探す</button>
      </form>
      <div class="toolbar">
        <span id="count" aria-live="polite">結果を待っています</span>
        <button id="refresh" type="button">新着を表示</button>
      </div>
      <section class="map-shell" aria-label="レストラン検索結果の地図">
        <div class="map-wrap">
          <div id="map" aria-label="レストランの位置"></div>
          <p id="empty">条件に合う店はまだありません。検索条件を変えてみてください。</p>
        </div>
        <aside id="detail" aria-live="polite"><p class="detail-empty">地図上の店を選ぶと詳細を表示します。</p></aside>
      </section>
      <div id="places" aria-label="検索結果のレストラン"></div>
      <p id="status" role="status">MCP からレストラン情報を受け取ります。</p>
    </main>
    <script type="module">
      import { App, PostMessageTransport, applyDocumentTheme, applyHostStyleVariables } from "https://esm.sh/@modelcontextprotocol/ext-apps@1.7.5";
      import L from "https://esm.sh/leaflet@1.9.4";

      const initialStatus = document.getElementById('status');
      const leafletCss = document.createElement('link');
      leafletCss.rel = 'stylesheet';
      leafletCss.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
      const leafletCssReady = new Promise((resolve, reject) => {
        leafletCss.addEventListener('load', resolve, { once: true });
        leafletCss.addEventListener('error', () => reject(new Error('地図のスタイルを読み込めませんでした。')), { once: true });
      });
      document.head.append(leafletCss);
      try {
        await leafletCssReady;
      } catch (error) {
        initialStatus.textContent = error instanceof Error ? error.message : '地図を読み込めませんでした。';
        throw error;
      }

      const nameInput = document.getElementById('name');
      const addressInput = document.getElementById('address');
      const form = document.getElementById('search-form');
      const searchButton = document.getElementById('search');
      const refreshButton = document.getElementById('refresh');
      const count = document.getElementById('count');
      const status = initialStatus;
      const detail = document.getElementById('detail');
      const empty = document.getElementById('empty');
      const places = document.getElementById('places');
      const app = new App({ name: 'Tacos restaurant map', version: '0.1.0' });
      const defaultCenter = [35.6762, 139.6503];
      const map = L.map('map', { zoomControl: true }).setView(defaultCenter, 11);
      const markers = new Map();
      let restaurants = [];
      let selectedId = null;

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const text = (value) => value === null || value === undefined ? '' : String(value);
      const number = (value) => typeof value === 'number' ? value : Number(value);
      const validCoordinates = (restaurant) => Number.isFinite(number(restaurant.latitude)) && Number.isFinite(number(restaurant.longitude));

      function resultPayload(result) {
        if (result?.structuredContent) return result.structuredContent;
        const value = result?.content?.find((item) => item.type === 'text')?.text;
        try {
          const parsed = JSON.parse(value || '[]');
          return Array.isArray(parsed) ? { restaurants: parsed } : parsed;
        } catch {
          return { restaurants: [] };
        }
      }

      function markerIcon(selected) {
        return L.divIcon({
          className: '',
          html: '<div class="taco-marker' + (selected ? ' selected' : '') + '"><span>🌮</span></div>',
          iconAnchor: [19, 38],
          iconSize: [38, 38],
        });
      }

      function safeUrl(value) {
        try {
          const url = new URL(text(value));
          return url.protocol === 'https:' ? url.toString() : null;
        } catch {
          return null;
        }
      }

      function renderDetail(restaurant) {
        detail.replaceChildren();
        if (!restaurant) {
          const message = document.createElement('p');
          message.className = 'detail-empty';
          message.textContent = '地図上の店を選ぶと詳細を表示します。';
          detail.append(message);
          return;
        }

        const card = document.createElement('article');
        card.className = 'detail-card';
        const photoUrl = safeUrl(restaurant.photoUrl);
        if (photoUrl) {
          const photo = document.createElement('img');
          photo.className = 'photo';
          photo.alt = text(restaurant.name) + 'の写真';
          photo.src = photoUrl;
          card.append(photo);
        }
        const body = document.createElement('div');
        body.className = 'detail-body';
        const title = document.createElement('h2');
        title.textContent = text(restaurant.name) || '名前のないレストラン';
        body.append(title);
        const address = document.createElement('p');
        address.className = 'address';
        address.textContent = text(restaurant.address);
        body.append(address);
        const coordinates = document.createElement('p');
        coordinates.className = 'coordinates';
        coordinates.textContent = number(restaurant.latitude).toFixed(6) + ', ' + number(restaurant.longitude).toFixed(6);
        body.append(coordinates);
        const mapsUrl = safeUrl(restaurant.googleMapsUrl);
        if (mapsUrl) {
          const maps = document.createElement('a');
          maps.className = 'maps';
          maps.href = mapsUrl;
          maps.rel = 'noopener noreferrer';
          maps.target = '_blank';
          maps.textContent = 'Google Mapsで開く →';
          maps.addEventListener('click', (event) => {
            event.preventDefault();
            void app.openLink({ url: mapsUrl });
          });
          body.append(maps);
        }
        card.append(body);
        detail.append(card);
      }

      function selectRestaurant(id, moveMap) {
        const restaurant = restaurants.find((item) => String(item.id) === String(id));
        if (!restaurant) return;
        selectedId = restaurant.id;
        markers.forEach((entry, markerId) => entry.setIcon(markerIcon(String(markerId) === String(selectedId))));
        places.querySelectorAll('.place').forEach((button) => {
          button.setAttribute('aria-pressed', String(button.dataset.id) === String(selectedId) ? 'true' : 'false');
        });
        renderDetail(restaurant);
        if (moveMap && validCoordinates(restaurant)) {
          map.flyTo([number(restaurant.latitude), number(restaurant.longitude)], Math.max(map.getZoom(), 15), { duration: .5 });
        }
      }

      function syncMap() {
        markers.forEach((marker) => marker.remove());
        markers.clear();
        places.replaceChildren();
        const bounds = [];

        restaurants.forEach((restaurant) => {
          if (!validCoordinates(restaurant)) return;
          const latLng = [number(restaurant.latitude), number(restaurant.longitude)];
          bounds.push(latLng);
          const marker = L.marker(latLng, { icon: markerIcon(false), title: text(restaurant.name) });
          marker.on('click', () => selectRestaurant(restaurant.id, false));
          marker.addTo(map);
          markers.set(restaurant.id, marker);

          const button = document.createElement('button');
          button.className = 'place';
          button.type = 'button';
          button.dataset.id = text(restaurant.id);
          button.setAttribute('aria-pressed', 'false');
          button.textContent = text(restaurant.name) || '名前のないレストラン';
          button.addEventListener('click', () => selectRestaurant(restaurant.id, true));
          places.append(button);
        });

        empty.classList.toggle('visible', bounds.length === 0);
        if (bounds.length === 1) map.setView(bounds[0], 15);
        if (bounds.length > 1) map.fitBounds(bounds, { padding: [42, 42], maxZoom: 16 });
        window.setTimeout(() => map.invalidateSize(), 0);
      }

      function render(payload) {
        restaurants = Array.isArray(payload?.restaurants) ? payload.restaurants.filter(validCoordinates) : [];
        count.textContent = restaurants.length + ' 件のレストラン';
        syncMap();
        const previous = restaurants.find((restaurant) => String(restaurant.id) === String(selectedId));
        const next = previous || restaurants[0];
        if (next) selectRestaurant(next.id, false);
        else {
          selectedId = null;
          renderDetail(null);
        }
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
          status.textContent = '更新しました。';
        } catch (error) {
          status.textContent = '取得に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー');
        } finally {
          searchButton.disabled = false;
          refreshButton.disabled = false;
        }
      }

      app.ontoolinput = (params) => {
        const args = params.arguments || {};
        if (typeof args.name === 'string') nameInput.value = args.name;
        if (typeof args.address === 'string') addressInput.value = args.address;
        status.textContent = '検索しています…';
      };
      app.ontoolresult = (result) => {
        render(resultPayload(result));
        status.textContent = '検索結果を地図に表示しています。';
      };
      app.onhostcontextchanged = (context) => {
        if (context.theme) applyDocumentTheme(context.theme);
        if (context.styles?.variables) applyHostStyleVariables(context.styles.variables);
        window.setTimeout(() => map.invalidateSize(), 0);
      };
      app.onteardown = () => {
        markers.forEach((marker) => marker.remove());
        markers.clear();
        map.remove();
        return {};
      };
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        void callTool('restaurant_search', searchArguments(), '検索しています…');
      });
      refreshButton.addEventListener('click', () => {
        void callTool('restaurant_list', { limit: 50 }, '新着の店を読み込んでいます…');
      });
      try {
        await app.connect(new PostMessageTransport());
      } catch (error) {
        status.textContent = 'MCP App への接続に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー');
      }
    </script>
  </body>
</html>`;
