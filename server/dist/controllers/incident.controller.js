"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeAndCreateIncident = analyzeAndCreateIncident;
exports.listIncidents = listIncidents;
exports.getIncidentById = getIncidentById;
exports.updateIncidentStatus = updateIncidentStatus;
const uuid_1 = require("uuid");
const shared_1 = require("@urbanshield/shared");
const gemini_1 = require("../lib/gemini");
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
async function analyzeAndCreateIncident(req, res, next) {
    try {
        const rawBody = req.body;
        // Parse form-data inputs with type coercion
        const parsedInput = shared_1.IncidentInputSchema.parse({
            description: rawBody.description,
            latitude: parseFloat(rawBody.latitude),
            longitude: parseFloat(rawBody.longitude),
            source: rawBody.source || 'CITIZEN_SOS',
            category_hint: rawBody.category_hint,
            title: rawBody.title,
            address: rawBody.address,
            has_trapped_individuals: rawBody.has_trapped_individuals === 'true' || rawBody.has_trapped_individuals === true,
            has_visible_flames: rawBody.has_visible_flames === 'true' || rawBody.has_visible_flames === true,
            has_chemical_odor: rawBody.has_chemical_odor === 'true' || rawBody.has_chemical_odor === true,
            reporter_phone: rawBody.reporter_phone,
            reporter_name: rawBody.reporter_name,
        });
        // Handle files (multer memory storage)
        const files = req.files;
        const imageFile = files?.['image']?.[0] || (req.file?.fieldname === 'image' ? req.file : undefined);
        const audioFile = files?.['audio']?.[0] || (req.file?.fieldname === 'audio' ? req.file : undefined);
        const mediaUrls = [];
        // Create Data URLs for immediate visual/audio playback in UI
        if (imageFile) {
            const b64 = imageFile.buffer.toString('base64');
            mediaUrls.push(`data:${imageFile.mimetype};base64,${b64}`);
        }
        if (audioFile) {
            const b64 = audioFile.buffer.toString('base64');
            mediaUrls.push(`data:${audioFile.mimetype};base64,${b64}`);
        }
        // Call Gemini 2.5 / 3.8 Flash SDK for structured triage
        const aiAnalysis = await (0, gemini_1.analyzeIncidentMultimodal)({
            description: parsedInput.description,
            categoryHint: parsedInput.category_hint,
            hasTrappedIndividuals: parsedInput.has_trapped_individuals,
            hasVisibleFlames: parsedInput.has_visible_flames,
            hasChemicalOdor: parsedInput.has_chemical_odor,
            imageBuffer: imageFile?.buffer,
            imageMimeType: imageFile?.mimetype,
            audioBuffer: audioFile?.buffer,
            audioMimeType: audioFile?.mimetype,
            audioTranscript: rawBody.audio_transcript,
        });
        const incidentId = (0, uuid_1.v4)();
        // Query nearest idle unit for the assigned primary agency
        const candidateUnits = await supabaseAdmin_1.db.getUnits({
            agency: aiAnalysis.primary_agency,
            status: 'IDLE',
            lat: parsedInput.latitude,
            lng: parsedInput.longitude,
        });
        const nearestUnit = candidateUnits[0] || null;
        const newIncident = {
            id: incidentId,
            reporter_id: req.body.reporter_id || null,
            title: aiAnalysis.title || `${aiAnalysis.domain.replace('_', ' ')} near ${parsedInput.address || 'Reported Location'}`,
            description: parsedInput.description,
            source: parsedInput.source,
            domain: aiAnalysis.domain,
            severity: aiAnalysis.severity,
            status: 'AI_VERIFIED',
            primary_agency: aiAnalysis.primary_agency,
            latitude: parsedInput.latitude,
            longitude: parsedInput.longitude,
            address: parsedInput.address || `${parsedInput.latitude.toFixed(4)}, ${parsedInput.longitude.toFixed(4)}`,
            media_urls: mediaUrls,
            confidence_score: aiAnalysis.confidence_score,
            hazard_perimeter_meters: aiAnalysis.hazard_perimeter_meters || 100,
            citizen_advisory: aiAnalysis.citizen_advisory,
            responder_tactical_brief: aiAnalysis.responder_tactical_brief,
            traffic_vms_text: aiAnalysis.traffic_vms_text,
            ai_raw_analysis: aiAnalysis,
            assigned_unit_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        await supabaseAdmin_1.db.insertIncident(newIncident);
        // Initial audit log
        await supabaseAdmin_1.db.addDispatchLog({
            incident_id: incidentId,
            previous_status: null,
            new_status: 'AI_VERIFIED',
            notes: `AI Triage: Verified by Gemini (${aiAnalysis.domain}, ${aiAnalysis.severity}, confidence: ${(aiAnalysis.confidence_score * 100).toFixed(0)}%)`,
        });
        return res.status(201).json({
            success: true,
            incident: newIncident,
            analysis: aiAnalysis,
            suggested_unit: nearestUnit,
        });
    }
    catch (err) {
        next(err);
    }
}
async function listIncidents(req, res, next) {
    try {
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const severity = typeof req.query.severity === 'string' ? req.query.severity : undefined;
        const agency = typeof req.query.agency === 'string' ? req.query.agency : undefined;
        const incidents = await supabaseAdmin_1.db.getIncidents({ status, severity, agency });
        // Optional GeoJSON format requested via header or ?format=geojson
        if (req.query.format === 'geojson') {
            const geojson = {
                type: 'FeatureCollection',
                features: incidents.map((inc) => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [inc.longitude, inc.latitude],
                    },
                    properties: {
                        id: inc.id,
                        title: inc.title,
                        domain: inc.domain,
                        severity: inc.severity,
                        status: inc.status,
                        agency: inc.primary_agency,
                        radius: inc.hazard_perimeter_meters,
                        advisory: inc.citizen_advisory,
                        vms: inc.traffic_vms_text,
                    },
                })),
            };
            return res.json(geojson);
        }
        return res.json({
            success: true,
            count: incidents.length,
            data: incidents,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getIncidentById(req, res, next) {
    try {
        const id = req.params.id;
        const incident = await supabaseAdmin_1.db.getIncidentById(id);
        if (!incident) {
            return res.status(404).json({ error: 'Incident not found' });
        }
        let assignedUnit = null;
        if (incident.assigned_unit_id) {
            const units = await supabaseAdmin_1.db.getUnits();
            assignedUnit = units.find((u) => u.id === incident.assigned_unit_id) || null;
        }
        const logs = await supabaseAdmin_1.db.getDispatchLogs(id);
        return res.json({
            success: true,
            data: incident,
            assigned_unit: assignedUnit,
            dispatch_logs: logs,
        });
    }
    catch (err) {
        next(err);
    }
}
async function updateIncidentStatus(req, res, next) {
    try {
        const id = req.params.id;
        const validated = shared_1.IncidentUpdateStatusSchema.parse(req.body);
        const incident = await supabaseAdmin_1.db.getIncidentById(id);
        if (!incident) {
            return res.status(404).json({ error: 'Incident not found' });
        }
        const previousStatus = incident.status;
        const updates = {
            status: validated.status,
        };
        if (validated.unit_id) {
            updates.assigned_unit_id = validated.unit_id;
            // Update unit status according to the incident status
            let unitStatus = 'ASSIGNED';
            if (validated.status === 'ON_SCENE')
                unitStatus = 'BUSY';
            if (validated.status === 'RESOLVED' || validated.status === 'CLOSED')
                unitStatus = 'IDLE';
            await supabaseAdmin_1.db.updateUnit(validated.unit_id, {
                status: unitStatus,
                assigned_incident_id: unitStatus === 'IDLE' ? null : id,
            });
        }
        else if (validated.status === 'RESOLVED' || validated.status === 'CLOSED') {
            // Free previously assigned unit
            if (incident.assigned_unit_id) {
                await supabaseAdmin_1.db.updateUnit(incident.assigned_unit_id, {
                    status: 'IDLE',
                    assigned_incident_id: null,
                });
            }
        }
        const updatedIncident = await supabaseAdmin_1.db.updateIncident(id, updates);
        // Record in dispatch audit log
        await supabaseAdmin_1.db.addDispatchLog({
            incident_id: id,
            unit_id: validated.unit_id || incident.assigned_unit_id || null,
            previous_status: previousStatus,
            new_status: validated.status,
            notes: validated.notes || `Status transitioned from ${previousStatus} to ${validated.status}`,
        });
        return res.json({
            success: true,
            data: updatedIncident,
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=incident.controller.js.map