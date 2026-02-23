import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  const type = request.nextUrl.searchParams.get("type") || "";
  const lat = request.nextUrl.searchParams.get("lat") || "52.3676";
  const lng = request.nextUrl.searchParams.get("lng") || "4.9041";

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json(
      { error: "Google Maps API key not configured" },
      { status: 500 }
    );
  }

  try {
    const params = new URLSearchParams({
      query,
      location: `${lat},${lng}`,
      radius: "50000",
      key: GOOGLE_MAPS_API_KEY,
      language: "nl",
    });

    if (type) {
      params.set("type", type);
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
    );
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", data.status, data.error_message);
      return NextResponse.json(
        { error: `Google Places API error: ${data.status}` },
        { status: 502 }
      );
    }

    const places = (data.results || []).map(
      (place: {
        place_id: string;
        name: string;
        formatted_address: string;
        rating?: number;
        photos?: { photo_reference: string }[];
        geometry: { location: { lat: number; lng: number } };
        types: string[];
      }) => ({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        rating: place.rating || null,
        photoUrl: place.photos?.[0]
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
          : null,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        types: place.types || [],
      })
    );

    return NextResponse.json(places);
  } catch (error) {
    console.error("Places search error:", error);
    return NextResponse.json(
      { error: "Failed to search places" },
      { status: 500 }
    );
  }
}
