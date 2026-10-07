"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listResponseUnits = listResponseUnits;
exports.updateResponseUnit = updateResponseUnit;
exports.assignUnitToIncident = assignUnitToIncident;
exports.listDispatchLogs = listDispatchLogs;
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
const geospatial_1 = require("../lib/geospatial");
async function listResponseUnits(req, res, next) {
    try {
        const { agency, status, lat, lng } = req.query;
        const latitude = lat ? parseFloat(lat) : undefined;
        const longitude = lng ? parseFloat(lng) : undefined;
        const normalizedQueryStatus = typeof status === 'string' ? status.trim().toUpperCase().replace(/\s+/g, '_') : undefined;
        const units = await supabaseAdmin_1.db.getUnits({
            agency,
            status: normalizedQueryStatus,
            lat: latitude,
            lng: longitude,
        });
        const enriched = units.map((u) => ({
            ...u,
            distance_formatted: u.distance_meters !== undefined ? (0, geospatial_1.formatDistance)(u.distance_meters) : null,
        }));
        return res.json({
            success: true,
            count: enriched.length,
            data: enriched,
        });
    }
    catch (err) {
        next(err);
    }
}
async function updateResponseUnit(req, res, next) {
    try {
        const id = req.params.id;
        const { status, assigned_incident_id, latitude, longitude } = req.body;
        let normalizedStatus = status;
        if (typeof status === 'string') {
            normalizedStatus = status.trim().toUpperCase().replace(/\s+/g, '_');
        }
        const updated = await supabaseAdmin_1.db.updateUnit(id, {
            ...(normalizedStatus && { status: normalizedStatus }),
            ...(assigned_incident_id !== undefined && { assigned_incident_id }),
            ...(latitude !== undefined && { latitude }),
            ...(longitude !== undefined && { longitude }),
        });
        if (!updated) {
            return res.status(404).json({ error: 'Response unit not found' });
        }
        return res.json({
            success: true,
            data: updated,
        });
    }
    catch (err) {
        next(err);
    }
}
async function assignUnitToIncident(req, res, next) {
    try {
        const { incidentId, unitId, notes } = req.body;
        if (!incidentId || !unitId) {
            return res.status(400).json({ error: 'incidentId and unitId are required' });
        }
        const incident = await supabaseAdmin_1.db.getIncidentById(incidentId);
        if (!incident) {
            return res.status(404).json({ error: 'Incident not found' });
        }
        // Update unit
        const unit = await supabaseAdmin_1.db.updateUnit(unitId, {
            status: 'ASSIGNED',
            assigned_incident_id: incidentId,
        });
        // Update incident
        const updatedIncident = await supabaseAdmin_1.db.updateIncident(incidentId, {
            status: 'DISPATCHED',
            assigned_unit_id: unitId,
        });
        // Add log
        const log = await supabaseAdmin_1.db.addDispatchLog({
            incident_id: incidentId,
            unit_id: unitId,
            previous_status: incident.status,
            new_status: 'DISPATCHED',
            notes: notes || `Unit ${unit?.unit_callsign || unitId} dispatched to scene`,
        });
        return res.json({
            success: true,
            incident: updatedIncident,
            unit,
            log,
        });
    }
    catch (err) {
        next(err);
    }
}
async function listDispatchLogs(req, res, next) {
    try {
        const { incidentId } = req.query;
        const logs = await supabaseAdmin_1.db.getDispatchLogs(incidentId);
        return res.json({
            success: true,
            count: logs.length,
            data: logs,
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=dispatch.controller.js.map