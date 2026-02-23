"use client";

import { useState } from "react";
import PlacesSearch from "@/components/PlacesSearch";
import MapView from "@/components/MapView";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Place {
  placeId: string;
  name: string;
  address: string;
  rating: number | null;
  photoUrl: string | null;
  latitude: number;
  longitude: number;
  types: string[];
}

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 52.3676, lng: 4.9041 });

  function handlePlaceSelect(place: Place) {
    setSelectedPlace(place);
    setMapCenter({ lat: place.latitude, lng: place.longitude });
  }

  const markers = places.map((p) => ({
    id: p.placeId,
    lat: p.latitude,
    lng: p.longitude,
    title: p.name,
    category: p.types[0] || "place",
  }));

  if (selectedPlace) {
    markers.push({
      id: selectedPlace.placeId,
      lat: selectedPlace.latitude,
      lng: selectedPlace.longitude,
      title: selectedPlace.name,
      category: "selected",
    });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Plekken Ontdekken</h1>
        <p className="text-muted-foreground mt-1">
          Zoek naar restaurants, hotels, bezienswaardigheden en meer
        </p>
      </div>

      <div className="flex-1 flex gap-6 px-6 pb-6 min-h-0">
        <div className="w-96 flex flex-col gap-4">
          <PlacesSearch
            onResults={setPlaces}
            onSelect={handlePlaceSelect}
          />

          <div className="flex-1 overflow-y-auto space-y-3">
            {places.map((place) => (
              <button
                key={place.placeId}
                onClick={() => handlePlaceSelect(place)}
                className="w-full text-left"
              >
                <Card className={cn(
                  "hover:shadow-md transition-shadow",
                  selectedPlace?.placeId === place.placeId && "ring-2 ring-primary"
                )}>
                  <CardContent className="p-4">
                    <h3 className="font-medium">{place.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{place.address}</p>
                    {place.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{place.rating}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 rounded-xl overflow-hidden border">
          <MapView
            markers={markers}
            center={mapCenter}
            zoom={selectedPlace ? 15 : 4}
          />
        </div>
      </div>
    </div>
  );
}
