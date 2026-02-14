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

export function TacoMap({ markers: _markers }: TacoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

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

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          map.setCenter([longitude, latitude]);
        },
        () => {
          // Geolocation denied or unavailable; keep default center (Tokyo)
        },
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={mapContainerRef} className="h-full w-full" />;
}
