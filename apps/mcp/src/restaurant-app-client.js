import {
  App,
  PostMessageTransport,
  applyDocumentTheme,
  applyHostStyleVariables,
} from "@modelcontextprotocol/ext-apps";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const DEFAULT_CENTER = [139.6503, 35.6762];
const DEFAULT_ZOOM = 12;
const nameInput = document.getElementById("name");
const addressInput = document.getElementById("address");
const form = document.getElementById("search-form");
const searchButton = document.getElementById("search");
const refreshButton = document.getElementById("refresh");
const count = document.getElementById("count");
const status = document.getElementById("status");
const empty = document.getElementById("empty");
const viewer = document.getElementById("viewer");
const mapContainer = document.getElementById("map");
const mapUnavailable = document.getElementById("map-unavailable");
const selectedName = document.getElementById("selected-name");
const selectedAddress = document.getElementById("selected-address");
const mapsLink = document.getElementById("maps-link");
const places = document.getElementById("places");
const app = new App({ name: "Tacos restaurant map", version: "0.1.0" });
const markerReferences = new Map();
let restaurants = [];
let selectedId = null;
let mapInstance = null;
let mapInitializationFailed = false;

const text = (value) => (value === null || value === undefined ? "" : String(value));

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

function safeGoogleMapsUrl(value) {
  try {
    const url = new URL(text(value));
    return url.protocol === "https:" &&
      url.hostname === "www.google.com" &&
      url.pathname.startsWith("/maps/")
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function coordinates(restaurant) {
  const longitude = Number(restaurant.longitude);
  const latitude = Number(restaurant.latitude);
  return Number.isFinite(longitude) && Number.isFinite(latitude) ? { longitude, latitude } : null;
}

function createMarkerElement(restaurant) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = "restaurant-map-marker";
  element.setAttribute("aria-label", `${text(restaurant.name) || "名前のないレストラン"}を選択`);
  element.title = text(restaurant.name) || "名前のないレストラン";
  element.addEventListener("click", () => selectRestaurant(restaurant.id));

  const pin = document.createElement("span");
  pin.className = "restaurant-map-pin";
  const label = document.createElement("span");
  label.textContent = "T";
  pin.append(label);
  element.append(pin);
  return element;
}

function ensureMap() {
  if (mapInstance || mapInitializationFailed) return mapInstance;

  try {
    mapInstance = new maplibregl.Map({
      container: mapContainer,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      maxZoom: 19,
    });
    mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");
    let mapIsUsable = false;
    mapInstance.on("idle", () => {
      mapIsUsable = true;
      mapUnavailable.hidden = markerReferences.size > 0;
    });
    mapInstance.on("error", () => {
      if (!mapIsUsable) mapUnavailable.hidden = false;
    });
    mapContainer.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest(".maplibregl-ctrl-attrib a, .maplibregl-ctrl-logo");
      if (!(link instanceof HTMLAnchorElement) || !link.href.startsWith("https://")) return;
      event.preventDefault();
      void app.openLink({ url: link.href });
    });
  } catch {
    mapInitializationFailed = true;
    mapContainer.hidden = true;
    mapUnavailable.hidden = false;
  }

  return mapInstance;
}

function removeMarkers() {
  markerReferences.forEach(({ marker }) => marker.remove());
  markerReferences.clear();
}

function syncMarkers() {
  const map = ensureMap();
  removeMarkers();

  const mappableRestaurants = restaurants
    .map((restaurant) => ({ restaurant, coordinates: coordinates(restaurant) }))
    .filter(({ coordinates: value }) => value !== null);

  mapContainer.hidden = !map || mappableRestaurants.length === 0;
  mapUnavailable.hidden = Boolean(map && mappableRestaurants.length > 0);
  if (!map) return [];

  for (const { restaurant, coordinates: position } of mappableRestaurants) {
    const element = createMarkerElement(restaurant);
    const marker = new maplibregl.Marker({ element, anchor: "bottom" })
      .setLngLat([position.longitude, position.latitude])
      .addTo(map);
    markerReferences.set(String(restaurant.id), { element, marker });
  }

  return mappableRestaurants;
}

function fitRestaurants(mappableRestaurants) {
  if (!mapInstance || mappableRestaurants.length === 0) return;

  if (mappableRestaurants.length === 1) {
    const position = mappableRestaurants[0].coordinates;
    mapInstance.jumpTo({ center: [position.longitude, position.latitude], zoom: 14 });
    return;
  }

  const firstPosition = mappableRestaurants[0].coordinates;
  const bounds = mappableRestaurants.reduce(
    (currentBounds, { coordinates: position }) =>
      currentBounds.extend([position.longitude, position.latitude]),
    new maplibregl.LngLatBounds(
      [firstPosition.longitude, firstPosition.latitude],
      [firstPosition.longitude, firstPosition.latitude],
    ),
  );
  mapInstance.fitBounds(bounds, { duration: 0, maxZoom: 14, padding: 72 });
}

function renderSelected({ moveMap = false } = {}) {
  const restaurant = restaurants.find((item) => String(item.id) === String(selectedId));
  if (!restaurant) return;

  selectedName.textContent = text(restaurant.name) || "名前のないレストラン";
  selectedAddress.textContent = text(restaurant.address);

  const externalUrl = safeGoogleMapsUrl(restaurant.googleMapsUrl);
  mapsLink.hidden = !externalUrl;
  if (externalUrl) mapsLink.href = externalUrl;
  else mapsLink.removeAttribute("href");

  markerReferences.forEach(({ element }, id) => {
    element.dataset.selected = String(id) === String(selectedId) ? "true" : "false";
  });
  places.querySelectorAll(".place").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.id) === String(selectedId) ? "true" : "false",
    );
  });

  const position = coordinates(restaurant);
  if (moveMap && position && mapInstance) {
    mapInstance.flyTo({
      center: [position.longitude, position.latitude],
      duration: 700,
      essential: true,
      zoom: Math.max(mapInstance.getZoom(), 15),
    });
  }
}

function selectRestaurant(id) {
  selectedId = id;
  renderSelected({ moveMap: true });
}

function render(payload) {
  restaurants = Array.isArray(payload?.restaurants) ? payload.restaurants : [];
  count.textContent = restaurants.length + " 件のレストラン";
  places.replaceChildren();
  empty.hidden = restaurants.length > 0;
  viewer.hidden = restaurants.length === 0;

  if (restaurants.length === 0) {
    selectedId = null;
    empty.textContent = "条件に合う店はまだありません。検索条件を変えてみてください。";
    removeMarkers();
    return;
  }

  const previous = restaurants.find((item) => String(item.id) === String(selectedId));
  selectedId = (previous || restaurants[0]).id;

  if (restaurants.length > 1) {
    for (const restaurant of restaurants) {
      const button = document.createElement("button");
      button.className = "place";
      button.type = "button";
      button.dataset.id = text(restaurant.id);
      button.textContent = text(restaurant.name) || "名前のないレストラン";
      button.addEventListener("click", () => selectRestaurant(restaurant.id));
      places.append(button);
    }
  }

  const mappableRestaurants = syncMarkers();
  fitRestaurants(mappableRestaurants);
  renderSelected();
  requestAnimationFrame(() => mapInstance?.resize());
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
    status.textContent =
      "取得に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー");
  } finally {
    searchButton.disabled = false;
    refreshButton.disabled = false;
  }
}

mapsLink.addEventListener("click", (event) => {
  event.preventDefault();
  if (mapsLink.href) void app.openLink({ url: mapsLink.href });
});

app.ontoolinput = (params) => {
  const args = params.arguments || {};
  if (typeof args.name === "string") nameInput.value = args.name;
  if (typeof args.address === "string") addressInput.value = args.address;
  status.textContent = "検索しています…";
};

app.ontoolresult = (result) => {
  render(resultPayload(result));
  status.textContent = "検索結果を地図に表示しています。";
};

app.onhostcontextchanged = (context) => {
  if (context.theme) applyDocumentTheme(context.theme);
  if (context.styles?.variables) applyHostStyleVariables(context.styles.variables);
  requestAnimationFrame(() => mapInstance?.resize());
};

app.onteardown = () => {
  removeMarkers();
  mapInstance?.remove();
  mapInstance = null;
  return {};
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
  status.textContent =
    "MCP Appへの接続に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー");
}
