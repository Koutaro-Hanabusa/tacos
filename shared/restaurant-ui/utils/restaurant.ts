export function textValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return value.toString();
  }
  return "";
}

export function safeHttpUrl(value: unknown) {
  try {
    const url = new URL(textValue(value));
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function safeGoogleMapsUrl(value: unknown) {
  try {
    const url = new URL(textValue(value));
    return url.protocol === "https:" &&
      url.hostname === "www.google.com" &&
      url.pathname.startsWith("/maps/")
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
