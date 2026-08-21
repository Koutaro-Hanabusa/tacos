import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";

export interface MapMarker {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface TacoMapProps {
  markers: MapMarker[];
  selectedId?: number;
  onSelect?: (id: number) => void;
}

const DEFAULT_CENTER: [number, number] = [139.6503, 35.6762];
const DEFAULT_ZOOM = 12;

function createRestaurantMarker(
  marker: MapMarker,
  selected: boolean,
  onSelect: ((id: number) => void) | undefined,
) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = "restaurant-map-marker";
  element.dataset.selected = selected ? "true" : "false";
  element.setAttribute("aria-label", `${marker.name}を選択`);
  element.title = marker.name;
  const label = document.createElement("span");
  label.textContent = "T";
  element.append(label);
  element.addEventListener("click", () => onSelect?.(marker.id));

  return element;
}

export function TacoMap({ markers, selectedId, onSelect }: TacoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRefs = useRef<maplibregl.Marker[]>([]);
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
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = markers.map((marker) => {
      return new maplibregl.Marker({
        element: createRestaurantMarker(marker, marker.id === selectedId, onSelect),
        anchor: "bottom",
      })
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(map);
    });

    if (markers.length > 0 && !didFitInitialMarkers.current) {
      didFitInitialMarkers.current = true;

      if (markers.length === 1) {
        const marker = markers[0];
        if (marker) map.jumpTo({ center: [marker.longitude, marker.latitude], zoom: 14 });
      } else {
        const bounds = markers.reduce(
          (currentBounds, marker) => currentBounds.extend([marker.longitude, marker.latitude]),
          new maplibregl.LngLatBounds(
            [markers[0]?.longitude ?? DEFAULT_CENTER[0], markers[0]?.latitude ?? DEFAULT_CENTER[1]],
            [markers[0]?.longitude ?? DEFAULT_CENTER[0], markers[0]?.latitude ?? DEFAULT_CENTER[1]],
          ),
        );

        map.fitBounds(bounds, { duration: 0, maxZoom: 14, padding: 72 });
      }
    }
  }, [markers, onSelect, selectedId]);

  useEffect(() => {
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

  return <div ref={mapContainerRef} className="h-full min-h-[22rem] w-full" />;
}
