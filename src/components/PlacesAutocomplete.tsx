"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getGoogleMapsLoader, apiKey } from "@/lib/google-maps";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, X } from "lucide-react";

interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  selectedAddress?: string;
}

export default function PlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Zoek een locatie...",
  selectedAddress,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onChangeRef = useRef(onChange);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const [ready, setReady] = useState(false);

  // Keep refs in sync without re-running useEffect
  onChangeRef.current = onChange;
  onPlaceSelectRef.current = onPlaceSelect;

  useEffect(() => {
    const loader = getGoogleMapsLoader();
    if (!loader || autocompleteRef.current) return;

    loader.importLibrary("places").then(() => {
      if (!inputRef.current) return;

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ["place_id", "name", "formatted_address", "geometry"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          const result: PlaceResult = {
            placeId: place.place_id || "",
            name: place.name || "",
            address: place.formatted_address || "",
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          };
          onChangeRef.current(result.name);
          onPlaceSelectRef.current(result);
        }
      });

      autocompleteRef.current = autocomplete;
      setReady(true);
    });
  }, []);

  const handleClear = useCallback(() => {
    onChange("");
    onPlaceSelect({
      placeId: "",
      name: "",
      address: "",
      latitude: 0,
      longitude: 0,
    });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onChange, onPlaceSelect]);

  if (!apiKey) {
    return (
      <div className="space-y-1">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        {!ready && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
        {value && ready && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          defaultValue={value}
          key={value === "" ? "empty" : "filled"}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 pr-8 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      {selectedAddress && (
        <p className="text-xs text-muted-foreground truncate pl-1">
          {selectedAddress}
        </p>
      )}
    </div>
  );
}
