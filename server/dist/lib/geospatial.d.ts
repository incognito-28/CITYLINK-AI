/**
 * Geospatial Utilities for UrbanShield
 * PostGIS math, Haversine spatial calculations, hazard exclusion zones, and detour generation.
 */
export interface LatLng {
    latitude: number;
    longitude: number;
}
/**
 * Calculates Haversine distance between two coordinates in meters.
 */
export declare function calculateDistanceMeters(point1: LatLng, point2: LatLng): number;
/**
 * Formats distance in meters into human-readable km or m.
 */
export declare function formatDistance(meters: number): string;
/**
 * Generates GeoJSON polygon coordinates for a hazard exclusion buffer zone.
 */
export declare function generateHazardPerimeterPolygon(center: LatLng, radiusMeters: number, pointsCount?: number): [number, number][];
/**
 * Computes an alternative detour route around a hazard area.
 */
export declare function calculateDetourWaypoints(start: LatLng, hazardCenter: LatLng, destination: LatLng, hazardRadiusMeters: number): LatLng[];
//# sourceMappingURL=geospatial.d.ts.map