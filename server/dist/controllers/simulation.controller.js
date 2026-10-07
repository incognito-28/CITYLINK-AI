"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSimulationFeed = seedSimulationFeed;
const uuid_1 = require("uuid");
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
const gemini_1 = require("../lib/gemini");
const SIMULATION_PRESETS = [
    {
        type: 'CCTV_STREAM',
        description: 'Autonomous Vision Alert: Heavy white smoke emitting from transit bus engine compartment inside Stockton St Tunnel. Pedestrians exiting via north portal.',
        latitude: 37.7915,
        longitude: -122.4072,
        address: 'Stockton St Tunnel & Sacramento St, San Francisco, CA',
        hasVisibleFlames: true,
        hasTrappedIndividuals: false,
        categoryHint: 'FIRE_RESCUE',
    },
    {
        type: 'IOT_SENSOR',
        description: 'Telemetry Ping: Acoustic leak sensor #409 detected instantaneous 80 PSI pressure drop. Massive subsurface water surge breaking asphalt surface.',
        latitude: 37.7812,
        longitude: -122.4114,
        address: '8th St & Mission St, San Francisco, CA',
        hasVisibleFlames: false,
        hasTrappedIndividuals: false,
        categoryHint: 'INFRASTRUCTURE_HAZARD',
    },
    {
        type: 'IOT_SENSOR',
        description: 'Environmental Sensor #CH-12: Volatile chemical threshold exceeded (0.85 ppm). Vapor plume drifting northeast with 12 mph ambient wind.',
        latitude: 37.7698,
        longitude: -122.3891,
        address: 'Illinois St & 16th St, San Francisco, CA',
        hasChemicalOdor: true,
        categoryHint: 'INFRASTRUCTURE_HAZARD',
    },
    {
        type: 'CITIZEN_SOS',
        description: 'Civic SOS Terminal #14: Citizen collapsed suddenly on plaza bench. Unresponsive, agonal breathing. Bystander CPR initiated.',
        latitude: 37.7879,
        longitude: -122.4075,
        address: 'Union Square Central Plaza, San Francisco, CA',
        categoryHint: 'MEDICAL_EMERGENCY',
    },
];
async function seedSimulationFeed(req, res, next) {
    try {
        const { presetIndex } = req.body;
        const selectedPreset = presetIndex !== undefined && SIMULATION_PRESETS[presetIndex]
            ? SIMULATION_PRESETS[presetIndex]
            : SIMULATION_PRESETS[Math.floor(Math.random() * SIMULATION_PRESETS.length)];
        console.log(`[UrbanShield Sim] Injecting automated telemetry: "${selectedPreset.description.slice(0, 50)}..."`);
        // Run AI triage
        const aiAnalysis = await (0, gemini_1.analyzeIncidentMultimodal)({
            description: selectedPreset.description,
            categoryHint: selectedPreset.categoryHint,
            hasVisibleFlames: selectedPreset.hasVisibleFlames,
            hasChemicalOdor: selectedPreset.hasChemicalOdor,
            hasTrappedIndividuals: selectedPreset.hasTrappedIndividuals,
        });
        const incidentId = (0, uuid_1.v4)();
        // Find nearest idle unit
        const candidateUnits = await supabaseAdmin_1.db.getUnits({
            agency: aiAnalysis.primary_agency,
            status: 'IDLE',
            lat: selectedPreset.latitude,
            lng: selectedPreset.longitude,
        });
        const nearestUnit = candidateUnits[0] || null;
        const incident = {
            id: incidentId,
            title: aiAnalysis.title,
            description: selectedPreset.description,
            source: selectedPreset.type,
            domain: aiAnalysis.domain,
            severity: aiAnalysis.severity,
            status: 'AI_VERIFIED',
            primary_agency: aiAnalysis.primary_agency,
            latitude: selectedPreset.latitude,
            longitude: selectedPreset.longitude,
            address: selectedPreset.address,
            media_urls: [],
            confidence_score: aiAnalysis.confidence_score,
            hazard_perimeter_meters: aiAnalysis.hazard_perimeter_meters,
            citizen_advisory: aiAnalysis.citizen_advisory,
            responder_tactical_brief: aiAnalysis.responder_tactical_brief,
            traffic_vms_text: aiAnalysis.traffic_vms_text,
            ai_raw_analysis: aiAnalysis,
            assigned_unit_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        await supabaseAdmin_1.db.insertIncident(incident);
        await supabaseAdmin_1.db.addDispatchLog({
            incident_id: incidentId,
            previous_status: null,
            new_status: 'AI_VERIFIED',
            notes: `Automated Telemetry Sensor Injection: ${selectedPreset.type} - Triaged by AI Core`,
        });
        return res.status(201).json({
            success: true,
            message: 'Automated telemetry simulated and triaged successfully',
            incident,
            analysis: aiAnalysis,
            suggested_unit: nearestUnit,
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=simulation.controller.js.map