import {
  App,
  PostMessageTransport,
  applyDocumentTheme,
  applyHostStyleVariables,
} from "@modelcontextprotocol/ext-apps";
import maplibregl from "maplibre-gl";

const DEFAULT_CENTER = [139.6503, 35.6762];
const DEFAULT_ZOOM = 12;
const PLACE_BASE_CLASS = "place group w-full border transition-colors";
const PLACE_DEFAULT_CLASS =
  "border-taco-border/60 bg-taco-surface/70 hover:border-taco-roja/70 hover:bg-taco-surface-raised";
const PLACE_SELECTED_CLASS = "border-taco-roja bg-taco-surface-raised";
const PLACE_BUTTON_CLASS =
  "place-select flex w-full gap-3 p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-taco-roja-strong";
const STATUS_ERROR_CLASS =
  "m-3 mt-0 border border-dashed border-taco-roja/60 bg-taco-paper-bright/70 px-3 py-2 text-xs leading-relaxed text-taco-roja-strong";
const count = document.getElementById("count");
const status = document.getElementById("status");
const empty = document.getElementById("empty");
const mapContainer = document.getElementById("map");
const mapUnavailable = document.getElementById("map-unavailable");
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

function safeImageUrl(value) {
  try {
    const url = new URL(text(value));
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
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

  const label = document.createElement("span");
  label.textContent = "T";
  element.append(label);
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
      mapUnavailable.hidden = true;
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

  mapContainer.hidden = !map;
  mapUnavailable.hidden = Boolean(map);
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

  markerReferences.forEach(({ element }, id) => {
    element.dataset.selected = String(id) === String(selectedId) ? "true" : "false";
  });
  places.querySelectorAll(".place").forEach((place) => {
    const isSelected = String(place.dataset.id) === String(selectedId);
    place.querySelector(".place-select")?.setAttribute("aria-pressed", String(isSelected));
    place.className = `${PLACE_BASE_CLASS} ${isSelected ? PLACE_SELECTED_CLASS : PLACE_DEFAULT_CLASS}`;
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

function createAddressMarker() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("class", "mt-0.5 size-3 shrink-0 text-taco-verde");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");
  icon.setAttribute("stroke-width", "2");
  icon.setAttribute("viewBox", "0 0 24 24");

  const pin = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pin.setAttribute(
    "d",
    "M20 10c0 5-5.5 10.5-7.4 12.3a.9.9 0 0 1-1.2 0C9.5 20.5 4 15 4 10a8 8 0 0 1 16 0",
  );
  const center = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  center.setAttribute("cx", "12");
  center.setAttribute("cy", "10");
  center.setAttribute("r", "3");
  icon.append(pin, center);
  return icon;
}

function createPlaceElement(restaurant) {
  const place = document.createElement("article");
  place.className = `${PLACE_BASE_CLASS} ${PLACE_DEFAULT_CLASS}`;
  place.dataset.id = text(restaurant.id);

  const button = document.createElement("button");
  button.className = PLACE_BUTTON_CLASS;
  button.type = "button";
  button.addEventListener("click", () => selectRestaurant(restaurant.id));

  const photo = document.createElement("span");
  photo.className =
    "grid h-20 w-20 shrink-0 place-items-center overflow-hidden border border-taco-tortilla/30 bg-taco-tortilla/20 font-display text-xl font-bold text-taco-ink";

  const image = document.createElement("img");
  image.alt = `${text(restaurant.name) || "名前のないレストラン"}の写真`;
  image.className = "size-full object-cover";
  image.loading = "lazy";
  const placeholder = document.createElement("span");
  placeholder.textContent = "T";
  placeholder.setAttribute("aria-hidden", "true");

  const imageUrl = safeImageUrl(restaurant.photoUrl);
  image.hidden = !imageUrl;
  placeholder.hidden = Boolean(imageUrl);
  if (imageUrl) image.src = imageUrl;
  image.addEventListener("error", () => {
    image.hidden = true;
    placeholder.hidden = false;
  });
  photo.append(image, placeholder);

  const content = document.createElement("span");
  content.className = "min-w-0 flex-1";
  const name = document.createElement("span");
  name.className = "block font-display text-lg leading-tight font-bold tracking-[-0.03em]";
  name.textContent = text(restaurant.name) || "名前のないレストラン";
  const address = document.createElement("span");
  address.className = "mt-2 flex gap-1.5 text-xs leading-relaxed text-taco-muted";
  const addressMarker = createAddressMarker();
  const addressText = document.createElement("span");
  addressText.textContent = text(restaurant.address);
  address.append(addressMarker, addressText);
  content.append(name, address);
  button.append(photo, content);

  place.append(button);
  const mapsUrl = safeGoogleMapsUrl(restaurant.googleMapsUrl);
  if (mapsUrl) {
    const mapsLink = document.createElement("a");
    mapsLink.className =
      "mx-3 mb-3 inline-flex min-h-8 items-center border border-taco-tortilla/60 bg-taco-paper-bright px-2.5 text-[0.68rem] font-bold text-taco-ink-soft no-underline transition-colors hover:bg-taco-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-taco-roja-strong";
    mapsLink.href = mapsUrl;
    mapsLink.target = "_blank";
    mapsLink.rel = "noopener noreferrer";
    mapsLink.textContent = "Google Mapsで開く ↗";
    mapsLink.addEventListener("click", (event) => {
      event.preventDefault();
      void app.openLink({ url: mapsUrl });
    });
    place.append(mapsLink);
  }

  return place;
}

function render(payload) {
  restaurants = Array.isArray(payload?.restaurants) ? payload.restaurants : [];
  count.textContent = String(restaurants.length);
  count.setAttribute("aria-label", `${restaurants.length}件のレストラン`);
  places.replaceChildren();

  if (restaurants.length === 0) {
    selectedId = null;
    empty.textContent = "条件に合う店はありません。";
    places.append(empty);
    removeMarkers();
    const map = ensureMap();
    map?.jumpTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });
    requestAnimationFrame(() => map?.resize());
    return;
  }

  const previous = restaurants.find((item) => String(item.id) === String(selectedId));
  selectedId = (previous || restaurants[0]).id;

  for (const restaurant of restaurants) {
    places.append(createPlaceElement(restaurant));
  }

  const mappableRestaurants = syncMarkers();
  fitRestaurants(mappableRestaurants);
  renderSelected();
  requestAnimationFrame(() => mapInstance?.resize());
}

function applyHostContext(context) {
  if (context?.theme) applyDocumentTheme(context.theme);
  if (context?.styles?.variables) applyHostStyleVariables(context.styles.variables);
  requestAnimationFrame(() => mapInstance?.resize());
}

function showError(message, detail = message) {
  restaurants = [];
  selectedId = null;
  count.textContent = "—";
  count.removeAttribute("aria-label");
  empty.textContent = message;
  places.replaceChildren(empty);
  removeMarkers();
  status.className = STATUS_ERROR_CLASS;
  status.textContent = detail;
}

app.ontoolinput = () => {
  status.textContent = "検索結果を受信しています…";
};

app.ontoolresult = (result) => {
  if (result?.isError) {
    const detail = result.content?.find((item) => item.type === "text")?.text;
    showError("検索結果を取得できませんでした。", detail || "検索に失敗しました。");
    return;
  }

  render(resultPayload(result));
  status.className = "sr-only";
  status.textContent = "検索結果を表示しました。";
};

app.onhostcontextchanged = applyHostContext;

app.onteardown = () => {
  removeMarkers();
  mapInstance?.remove();
  mapInstance = null;
  return {};
};

try {
  await app.connect(new PostMessageTransport());
  applyHostContext(app.getHostContext());
} catch (error) {
  showError(
    "MCP Appに接続できませんでした。",
    "接続に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"),
  );
}
