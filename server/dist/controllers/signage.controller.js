"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveSignage = getActiveSignage;
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
async function getActiveSignage(_req, res, next) {
    try {
        const allIncidents = await supabaseAdmin_1.db.getIncidents();
        // Only active unresolved incidents should broadcast to roadside LED boards
        const activeIncidents = allIncidents.filter((inc) => ['DETECTED', 'AI_VERIFIED', 'DISPATCHED', 'ON_SCENE'].includes(inc.status));
        const signs = activeIncidents.map((inc, index) => {
            // Determine signage priority
            const isUrgent = inc.severity === 'CRITICAL' || inc.severity === 'HIGH';
            // Default fallback VMS text if not generated
            const vmsText = inc.traffic_vms_text ||
                `${inc.domain.replace('_', ' ')} AT ${inc.address?.toUpperCase() || 'METRO SECTOR'} - DETOUR ADVISED`;
            return {
                sign_id: `VMS-${100 + index}`,
                terminal_name: `Civic VMS Gantry #${index + 1} (${inc.address?.split(',')[0] || 'Corridor'})`,
                incident_id: inc.id,
                severity: inc.severity,
                status: inc.status,
                latitude: inc.latitude + (index % 2 === 0 ? 0.003 : -0.003),
                longitude: inc.longitude + (index % 2 === 0 ? 0.003 : -0.003),
                vms_display_line_1: vmsText.slice(0, 30),
                vms_display_line_2: vmsText.slice(30, 60) || 'REDUCE SPEED - PREPARE TO STOP',
                raw_vms_text: vmsText,
                flashing_amber_alert: isUrgent,
                recommended_speed_mph: inc.severity === 'CRITICAL' ? 15 : inc.severity === 'HIGH' ? 25 : 35,
                detour_instructions: inc.citizen_advisory || 'Follow municipal bypass signage.',
                last_updated: inc.updated_at,
            };
        });
        return res.json({
            success: true,
            active_boards_count: signs.length,
            data: signs,
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=signage.controller.js.map