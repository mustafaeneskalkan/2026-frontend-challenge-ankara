"use client";

import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import type { BadgeColor } from "@/components/Investigation/Badge";

export type LeafletMarkerPin = {
  key: string;
  position: { lat: number; lng: number };
  title?: string | null;
  subtitle?: string | null;
  color?: BadgeColor;
  popup?: ReactNode;
};

export type LeafletMapProps = {
  markers: LeafletMarkerPin[];
  className?: string;
};

function FitToMarkers(props: { positions: LatLngExpression[] }) {
  const map = useMap();

  useEffect(() => {
    if (!props.positions.length) return;

    const bounds = L.latLngBounds(props.positions);
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
  }, [map, props.positions]);

  return null;
}

const PIN_CLASS_BY_COLOR: Record<BadgeColor, string> = {
  zinc: "bg-zinc-600 border-zinc-800",
  blue: "bg-blue-600 border-blue-800",
  green: "bg-emerald-600 border-emerald-800",
  amber: "bg-amber-500 border-amber-700",
  red: "bg-red-600 border-red-800",
  violet: "bg-violet-600 border-violet-800",
};

const iconCache = new Map<string, L.DivIcon>();

function pinIcon(color: BadgeColor = "zinc"): L.DivIcon {
  const key = color;
  const existing = iconCache.get(key);
  if (existing) return existing;

  const colorClass = PIN_CLASS_BY_COLOR[color] ?? PIN_CLASS_BY_COLOR.zinc;
  const icon = L.divIcon({
    className: "leaflet-map-pin",
    html: `<span class="block h-4 w-4 rounded-full border-2 ${colorClass}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
  iconCache.set(key, icon);
  return icon;
}

export default function LeafletMapInner(props: LeafletMapProps) {
  const center: LatLngExpression = props.markers.length
    ? [props.markers[0]!.position.lat, props.markers[0]!.position.lng]
    : [0, 0];

  const positions = useMemo<LatLngExpression[]>(
    () => props.markers.map((m) => [m.position.lat, m.position.lng]),
    [props.markers],
  );

  return (
    <MapContainer
      center={center}
      zoom={13}
      className={props.className}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitToMarkers positions={positions} />

      {props.markers.map((m) => (
        <Marker
          key={m.key}
          position={[m.position.lat, m.position.lng] as [number, number]}
          icon={pinIcon(m.color)}
        >
          {m.popup ? (
            <Popup>{m.popup}</Popup>
          ) : m.title || m.subtitle ? (
            <Popup>
              {m.title ? <div className="font-medium">{m.title}</div> : null}
              {m.subtitle ? (
                <div className="text-sm opacity-80">{m.subtitle}</div>
              ) : null}
            </Popup>
          ) : null}
        </Marker>
      ))}
    </MapContainer>
  );
}
