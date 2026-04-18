"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";

export type LeafletMarkerPin = {
  key: string;
  position: { lat: number; lng: number };
  title?: string | null;
  subtitle?: string | null;
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

const defaultMarkerIcon = L.icon({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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
          icon={defaultMarkerIcon}
        >
          {m.title || m.subtitle ? (
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
