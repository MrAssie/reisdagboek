"use client";

import { useState } from "react";

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

interface PlacesSearchProps {
  onResults: (places: Place[]) => void;
  onSelect: (place: Place) => void;
}

const placeTypes = [
  { value: "", label: "Alles" },
  { value: "restaurant", label: "Restaurants" },
  { value: "tourist_attraction", label: "Bezienswaardigheden" },
  { value: "park", label: "Parken" },
  { value: "museum", label: "Musea" },
  { value: "shopping_mall", label: "Winkels" },
  { value: "lodging", label: "Hotels" },
  { value: "cafe", label: "Cafés" },
  { value: "bar", label: "Bars" },
];

export default function PlacesSearch({ onResults }: PlacesSearchProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ query, type });
      const res = await fetch(`/api/places/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        onResults(data);
      }
    } catch {
      console.error("Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSearch} className="space-y-3">
      <div className="relative">
        <input
          type="text"
          className="input-field pl-10"
          placeholder="Zoek plekken..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
      </div>

      <div className="flex gap-2">
        <select
          className="input-field flex-1"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {placeTypes.map((pt) => (
            <option key={pt.value} value={pt.value}>
              {pt.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-primary whitespace-nowrap disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block animate-spin">⟳</span>
          ) : (
            "Zoeken"
          )}
        </button>
      </div>
    </form>
  );
}
