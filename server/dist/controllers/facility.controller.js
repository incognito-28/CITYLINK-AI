"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearestFacilities = getNearestFacilities;
exports.listAllFacilities = listAllFacilities;
const shared_1 = require("@urbanshield/shared");
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
const geospatial_1 = require("../lib/geospatial");
async function getNearestFacilities(req, res, next) {
    try {
        const query = shared_1.NearestFacilityQuerySchema.parse(req.query);
        const facilities = await supabaseAdmin_1.db.getFacilities({
            lat: query.lat,
            lng: query.lng,
            agency: query.agency,
            radiusMeters: query.radiusMeters,
        });
        const enriched = facilities.map((f) => ({
            ...f,
            distance_formatted: f.distance_meters !== undefined ? (0, geospatial_1.formatDistance)(f.distance_meters) : null,
        }));
        return res.json({
            success: true,
            origin: { latitude: query.lat, longitude: query.lng },
            radius_meters: query.radiusMeters,
            count: enriched.length,
            data: enriched,
        });
    }
    catch (err) {
        next(err);
    }
}
async function listAllFacilities(req, res, next) {
    try {
        const { agency } = req.query;
        const facilities = await supabaseAdmin_1.db.getFacilities({ agency });
        return res.json({
            success: true,
            count: facilities.length,
            data: facilities,
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=facility.controller.js.map