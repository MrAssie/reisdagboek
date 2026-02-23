"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";

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
  { value: "all", label: "Alles" },
  { value: "restaurant", label: "Restaurants" },
  { value: "tourist_attraction", label: "Bezienswaardigheden" },
  { value: "park", label: "Parken" },
  { value: "museum", label: "Musea" },
  { value: "shopping_mall", label: "Winkels" },
  { value: "lodging", label: "Hotels" },
  { value: "cafe", label: "Cafes" },
  { value: "bar", label: "Bars" },
];

export default function PlacesSearch({ onResults }: PlacesSearchProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ query, type: type === "all" ? "" : type });
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          className="pl-9"
          placeholder="Zoek plekken..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {placeTypes.map((pt) => (
              <SelectItem key={pt.value} value={pt.value}>
                {pt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Zoeken"}
        </Button>
      </div>
    </form>
  );
}
