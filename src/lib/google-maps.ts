import { Loader } from "@googlemaps/js-api-loader";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

let loader: Loader | null = null;

export function getGoogleMapsLoader(): Loader | null {
  if (!apiKey) return null;
  if (!loader) {
    loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "marker"],
    });
  }
  return loader;
}

export { apiKey };
