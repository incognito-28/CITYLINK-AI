/**
 * Google Maps, Places & Real-Time Navigation Integration Service for CITYLINK AI
 * Provides real POI discovery (hospitals, police, fire, pharmacies), real traffic-aware driving routes,
 * reverse geocoding, and location search according to the user's actual GPS coordinates.
 */
export interface PlacePOI {
    id: string;
    name: string;
    category: 'hospital' | 'police' | 'fire_station' | 'pharmacy' | 'emergency';
    agency: 'HEALTH_EMS' | 'POLICE' | 'FIRE_DEPARTMENT' | 'DISASTER_MANAGEMENT' | 'TRAFFIC_AUTHORITY';
    address: string;
    latitude: number;
    longitude: number;
    contact_phone?: string;
    open_now?: boolean | null;
    rating?: number | null;
    user_ratings_total?: number | null;
    distance_meters: number;
    distance_formatted: string;
    source: 'google_places' | 'live_places_engine';
    place_id?: string;
}
export interface NavigationRouteResult {
    origin: {
        latitude: number;
        longitude: number;
    };
    destination: {
        latitude: number;
        longitude: number;
    };
    distance_meters: number;
    distance_text: string;
    duration_seconds: number;
    duration_text: string;
    duration_in_traffic_text?: string;
    polyline: [number, number][];
    steps: {
        instruction: string;
        distance: string;
        duration: string;
    }[];
    source: 'google_directions' | 'live_osrm_engine';
    warning?: string;
}
export declare function getGoogleMapsApiKey(): string;
export declare function setRuntimeGoogleMapsKey(key: string): void;
/**
 * Decodes Google Maps Encoded Polyline algorithm into array of [lat, lng]
 */
export declare function decodeGooglePolyline(encoded: string): [number, number][];
/**
 * Fetches real nearby emergency services from Google Places API (or live OpenStreetMap engine)
 */
export declare function fetchRealNearbyPlaces(params: {
    latitude: number;
    longitude: number;
    category?: string;
    radiusMeters?: number;
}): Promise<PlacePOI[]>;
/**
 * Calculates a real driving route with distance, ETA, and turn-by-turn geometry
 * Uses Google Directions API with real traffic if API key provided, or OSRM live routing engine
 */
export declare function calculateRealRoute(params: {
    originLat: number;
    originLng: number;
    destLat: number;
    destLng: number;
}): Promise<NavigationRouteResult>;
/**
 * Searches real addresses or landmarks (Geocoding search)
 */
export declare function searchRealLocation(query: string): Promise<Array<{
    name: string;
    latitude: number;
    longitude: number;
    display_name: string;
}>>;
//# sourceMappingURL=googleMaps.d.ts.map