import {
  App,
  PostMessageTransport,
  applyDocumentTheme,
  applyHostStyleVariables,
} from "@modelcontextprotocol/ext-apps";

const apiKey = document.querySelector('meta[name="google-maps-embed-api-key"]')?.content || "";
const nameInput = document.getElementById("name");
const addressInput = document.getElementById("address");
const form = document.getElementById("search-form");
const searchButton = document.getElementById("search");
const refreshButton = document.getElementById("refresh");
const count = document.getElementById("count");
const status = document.getElementById("status");
const empty = document.getElementById("empty");
const viewer = document.getElementById("viewer");
const map = document.getElementById("map");
const mapUnavailable = document.getElementById("map-unavailable");
const selectedName = document.getElementById("selected-name");
const selectedAddress = document.getElementById("selected-address");
const mapsLink = document.getElementById("maps-link");
const places = document.getElementById("places");
const app = new App({ name: "Tacos restaurant map", version: "0.1.0" });
let restaurants = [];
let selectedId = null;

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

function embedUrl(restaurant) {
  if (!apiKey) return null;
  const url = new URL("https://www.google.com/maps/embed/v1/place");
  url.searchParams.set("key", apiKey);
  url.searchParams.set(
    "q",
    [text(restaurant.name), text(restaurant.address)].filter(Boolean).join(", "),
  );
  return url.toString();
}

function renderSelected() {
  const restaurant = restaurants.find((item) => String(item.id) === String(selectedId));
  if (!restaurant) return;

  selectedName.textContent = text(restaurant.name) || "名前のないレストラン";
  selectedAddress.textContent = text(restaurant.address);

  const externalUrl = safeGoogleMapsUrl(restaurant.googleMapsUrl);
  mapsLink.hidden = !externalUrl;
  if (externalUrl) mapsLink.href = externalUrl;

  const embeddedUrl = embedUrl(restaurant);
  map.hidden = !embeddedUrl;
  mapUnavailable.hidden = Boolean(embeddedUrl);
  if (embeddedUrl) {
    map.title = selectedName.textContent + "のGoogle Maps";
    map.src = embeddedUrl;
  } else {
    map.removeAttribute("src");
  }

  places.querySelectorAll(".place").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.id) === String(selectedId) ? "true" : "false",
    );
  });
}

function selectRestaurant(id) {
  selectedId = id;
  renderSelected();
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
    map.removeAttribute("src");
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

  renderSelected();
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
};

app.onteardown = () => {
  map.src = "about:blank";
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
