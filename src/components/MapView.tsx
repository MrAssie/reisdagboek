"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface Marker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: string;
}

interface MapViewProps {
  markers?: Marker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (marker: Marker) => void;
}

const categoryColors: Record<string, string> = {
  sightseeing: "#DC2626",
  food: "#EA580C",
  transport: "#2563EB",
  shopping: "#DB2777",
  accommodation: "#7C3AED",
  culture: "#4F46E5",
  nature: "#16A34A",
  selected: "#DC2626",
  place: "#6B7280",
};

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function MapView({
  markers = [],
  center = { lat: 35.6762, lng: 139.6503 },
  zoom = 6,
  onMarkerClick,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [error, setError] = useState<string | null>(
    !apiKey
      ? "Google Maps API key niet geconfigureerd. Voeg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY toe aan je .env bestand."
      : null
  );

  useEffect(() => {
    if (!apiKey) return;

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "marker"],
    });

    loader
      .importLibrary("maps")
      .then((google) => {
        if (!mapRef.current) return;

        const map = new google.Map(mapRef.current, {
          center,
          zoom,
          mapId: "japan-reis-tracker",
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        mapInstanceRef.current = map;
      })
      .catch((err) => {
        console.error("Failed to load Google Maps:", err);
        setError("Kon Google Maps niet laden. Controleer je API key.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    markers.forEach((marker) => {
      const pinElement = document.createElement("div");
      pinElement.style.width = "28px";
      pinElement.style.height = "28px";
      pinElement.style.borderRadius = "50%";
      pinElement.style.backgroundColor = categoryColors[marker.category] || "#DC2626";
      pinElement.style.border = "3px solid white";
      pinElement.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      pinElement.style.cursor = "pointer";

      const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: marker.lat, lng: marker.lng },
        map,
        title: marker.title,
        content: pinElement,
      });

      if (onMarkerClick) {
        advancedMarker.addListener("click", () => onMarkerClick(marker));
      }

      markersRef.current.push(advancedMarker);
    });

    // Fit bounds if multiple markers
    if (markers.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
      map.fitBounds(bounds, 50);
    } else if (markers.length === 1) {
      map.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
      map.setZoom(15);
    }
  }, [markers, onMarkerClick]);

  // Update center
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.panTo(center);
    }
  }, [center]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <p className="text-4xl mb-4">🗺️</p>
          <p className="text-japan-gray text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
}
