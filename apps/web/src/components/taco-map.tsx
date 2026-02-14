import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";

export interface MapMarker {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface TacoMapProps {
  markers?: MapMarker[];
}

const DEFAULT_CENTER: [number, number] = [139.6503, 35.6762]; // Tokyo [lng, lat]
const DEFAULT_ZOOM = 13;

function createCurrentLocationMarker(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "current-location-marker";
  el.innerHTML = `
    <div class="current-location-pulse"></div>
    <div class="current-location-dot"></div>
  `;
  return el;
}

function injectCurrentLocationStyles(): HTMLStyleElement {
  const style = document.createElement("style");
  style.textContent = `
    .current-location-marker {
      position: relative;
      width: 12px;
      height: 12px;
    }
    .current-location-dot {
      width: 12px;
      height: 12px;
      background: #4285f4;
      border: 2px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
      position: absolute;
      top: 0;
      left: 0;
    }
    .current-location-pulse {
      width: 12px;
      height: 12px;
      background: rgba(66, 133, 244, 0.3);
      border-radius: 50%;
      position: absolute;
      top: 0;
      left: 0;
      animation: current-location-pulse-animation 2s ease-out infinite;
    }
    @keyframes current-location-pulse-animation {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      100% {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  return style;
}

export function TacoMap({ markers: _markers }: TacoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const styleEl = injectCurrentLocationStyles();

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

    let locationMarker: maplibregl.Marker | null = null;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          map.setCenter([longitude, latitude]);

          locationMarker = new maplibregl.Marker({
            element: createCurrentLocationMarker(),
            anchor: "center",
          })
            .setLngLat([longitude, latitude])
            .addTo(map);
        },
        () => {
          // Geolocation denied or unavailable; keep default center (Tokyo)
        },
      );
    }

    return () => {
      locationMarker?.remove();
      map.remove();
      mapRef.current = null;
      styleEl.remove();
    };
  }, []);

  return <div ref={mapContainerRef} className="h-full w-full" />;
}
