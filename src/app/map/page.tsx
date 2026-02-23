"use client";

import { useEffect, useState } from "react";
import MapView from "@/components/MapView";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Activity {
  id: string;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string;
  day: { date: string; title: string };
}

export default function MapPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    try {
      const res = await fetch("/api/activities");
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch {
      console.error("Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  }

  const markers = activities
    .filter((a) => a.latitude && a.longitude)
    .map((a) => ({
      id: a.id,
      lat: a.latitude!,
      lng: a.longitude!,
      title: a.name,
      category: a.category,
    }));

  const defaultCenter = markers.length > 0
    ? { lat: markers[0].lat, lng: markers[0].lng }
    : { lat: 52.3676, lng: 4.9041 };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Kaart</h1>
        <p className="text-muted-foreground mt-1">
          Al je activiteiten op de kaart —{" "}
          <Badge variant="secondary" className="font-normal">
            {markers.length} locaties
          </Badge>
        </p>
      </div>

      <div className="flex-1 px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="h-full rounded-xl overflow-hidden border">
            <MapView
              markers={markers}
              center={defaultCenter}
              zoom={markers.length > 0 ? 6 : 4}
            />
          </div>
        )}
      </div>
    </div>
  );
}
