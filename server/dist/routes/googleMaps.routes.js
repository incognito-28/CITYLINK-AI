"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const googleMaps_1 = require("../lib/googleMaps");
const router = (0, express_1.Router)();
// GET /api/v1/maps/status - Check Google Maps API status
router.get('/status', (req, res) => {
    const key = (0, googleMaps_1.getGoogleMapsApiKey)();
    return res.json({
        success: true,
        hasApiKey: !!key,
        keyPreview: key ? `${key.slice(0, 6)}...${key.slice(-4)}` : null,
        provider: key ? 'Google Maps Official API (Places & Directions)' : 'Live Spatial Network Engine',
        services: {
            places: key ? 'Google Places API' : 'Overpass / OSM Live Network',
            routing: key ? 'Google Directions API with Real Traffic' : 'OSRM Live Road Navigation Engine',
            geocoding: key ? 'Google Geocoding API' : 'Nominatim Live Search',
        },
    });
});
// POST /api/v1/maps/config - Update or set Google Maps API key
router.post('/config', (req, res) => {
    const { apiKey } = req.body;
    if (typeof apiKey === 'string') {
        (0, googleMaps_1.setRuntimeGoogleMapsKey)(apiKey);
        return res.json({
            success: true,
            message: 'Google Maps API key updated successfully.',
            hasApiKey: !!apiKey,
        });
    }
    return res.status(400).json({ success: false, message: 'Invalid apiKey parameter.' });
});
// GET /api/v1/maps/places/nearby - Real nearby emergency services
router.get('/places/nearby', async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const category = req.query.category || 'all';
        const radiusMeters = req.query.radius ? parseInt(req.query.radius, 10) : 8000;
        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ success: false, message: 'Valid lat and lng query parameters required.' });
        }
        const places = await (0, googleMaps_1.fetchRealNearbyPlaces)({
            latitude: lat,
            longitude: lng,
            category,
            radiusMeters,
        });
        return res.json({
            success: true,
            origin: { latitude: lat, longitude: lng },
            count: places.length,
            data: places,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});
// GET /api/v1/maps/route - Real route calculation with traffic and turn-by-turn guidance
router.get('/route', async (req, res) => {
    try {
        const originLat = parseFloat(req.query.originLat);
        const originLng = parseFloat(req.query.originLng);
        const destLat = parseFloat(req.query.destLat);
        const destLng = parseFloat(req.query.destLng);
        if (isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
            return res.status(400).json({
                success: false,
                message: 'originLat, originLng, destLat, and destLng query parameters are required.',
            });
        }
        const route = await (0, googleMaps_1.calculateRealRoute)({
            originLat,
            originLng,
            destLat,
            destLng,
        });
        return res.json({
            success: true,
            data: route,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});
// GET /api/v1/maps/search - Address and location search (change location feature)
router.get('/search', async (req, res) => {
    try {
        const q = req.query.q;
        if (!q || q.trim().length === 0) {
            return res.json({ success: true, data: [] });
        }
        const locations = await (0, googleMaps_1.searchRealLocation)(q);
        return res.json({
            success: true,
            data: locations,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=googleMaps.routes.js.map