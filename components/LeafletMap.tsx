"use client";

import dynamic from "next/dynamic";

import type { LeafletMapProps } from "@/components/LeafletMapInner";

const LeafletMapInner = dynamic(() => import("@/components/LeafletMapInner"), {
  ssr: false,
});

export type { LeafletMapProps };

export default function LeafletMap(props: LeafletMapProps) {
  return <LeafletMapInner {...props} />;
}
