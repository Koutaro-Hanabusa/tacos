import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";

export interface RestaurantMarker {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface RestaurantMapProps {
  markers: RestaurantMarker[];
  selectedId?: number;
  onSelect?: (id: number) => void;
}

interface MarkerReference {
  element: HTMLButtonElement;
  marker: maplibregl.Marker;
}

const DEFAULT_CENTER: [number, number] = [139.6503, 35.6762];
const DEFAULT_ZOOM = 12;

function createMarkerElement(
  marker: RestaurantMarker,
  onSelect: ((id: number) => void) | undefined,
) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = "restaurant-map-marker";
  element.setAttribute("aria-label", `${marker.name}を選択`);
  element.title = marker.name;
  element.onclick = () => onSelect?.(marker.id);

  const label = document.createElement("span");
  label.textContent = "T";
  element.append(label);

  return element;
}

export function RestaurantMap({ markers, selectedId, onSelect }: RestaurantMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRefs = useRef(new Map<number, MarkerReference>());
  const didFitInitialMarkers = useRef(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
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
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      markerRefs.current.forEach(({ marker }) => marker.remove());
      markerRefs.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextIds = new Set(markers.map((marker) => marker.id));
    markerRefs.current.forEach((reference, id) => {
      if (nextIds.has(id)) return;

      reference.marker.remove();
      markerRefs.current.delete(id);
    });

    markers.forEach((marker) => {
      const existing = markerRefs.current.get(marker.id);
      if (existing) {
        existing.element.setAttribute("aria-label", `${marker.name}を選択`);
        existing.element.title = marker.name;
        existing.element.onclick = () => onSelect?.(marker.id);
        existing.marker.setLngLat([marker.longitude, marker.latitude]);
        return;
      }

      const element = createMarkerElement(marker, onSelect);
      const mapMarker = new maplibregl.Marker({ element, anchor: "bottom" })
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(map);
      markerRefs.current.set(marker.id, { element, marker: mapMarker });
    });

    if (markers.length === 0 || didFitInitialMarkers.current) return;
    didFitInitialMarkers.current = true;

    if (markers.length === 1) {
      const marker = markers[0];
      if (marker) map.jumpTo({ center: [marker.longitude, marker.latitude], zoom: 14 });
      return;
    }

    const firstMarker = markers[0];
    const bounds = markers.reduce(
      (currentBounds, marker) => currentBounds.extend([marker.longitude, marker.latitude]),
      new maplibregl.LngLatBounds(
        [firstMarker?.longitude ?? DEFAULT_CENTER[0], firstMarker?.latitude ?? DEFAULT_CENTER[1]],
        [firstMarker?.longitude ?? DEFAULT_CENTER[0], firstMarker?.latitude ?? DEFAULT_CENTER[1]],
      ),
    );
    map.fitBounds(bounds, { duration: 0, maxZoom: 14, padding: 72 });
  }, [markers, onSelect]);

  useEffect(() => {
    markerRefs.current.forEach(({ element }, id) => {
      element.dataset.selected = id === selectedId ? "true" : "false";
    });

    if (selectedId === undefined) return;

    const marker = markers.find((candidate) => candidate.id === selectedId);
    if (!marker) return;

    mapRef.current?.flyTo({
      center: [marker.longitude, marker.latitude],
      duration: 700,
      essential: true,
      zoom: Math.max(mapRef.current.getZoom(), 15),
    });
  }, [markers, selectedId]);

  return <div ref={mapContainerRef} className="taco-map h-full min-h-[22rem] w-full" />;
}
