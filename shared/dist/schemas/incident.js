"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NearestFacilityQuerySchema = exports.IncidentUpdateStatusSchema = exports.IncidentInputSchema = exports.IncidentSourceEnum = exports.UnitStatusEnum = exports.IncidentStatusEnum = exports.IncidentSeverityEnum = exports.IncidentDomainEnum = exports.AgencyTypeEnum = exports.UserRoleEnum = void 0;
let zod_1;
try {
    zod_1 = require("zod");
} catch (_e1) {
    try {
        zod_1 = require("../../../server/node_modules/zod");
    } catch (_e2) {
        try {
            zod_1 = require("../../server/node_modules/zod");
        } catch (_e3) {
            zod_1 = require("../../../../server/node_modules/zod");
        }
    }
}
exports.UserRoleEnum = zod_1.z.enum([
    'citizen',
    'operator',
    'responder',
    'admin',
    'police',
    'fire',
    'medical',
    'traffic',
    'disaster'
]);
exports.AgencyTypeEnum = zod_1.z.enum([
    'POLICE',
    'FIRE_DEPARTMENT',
    'HEALTH_EMS',
    'TRAFFIC_AUTHORITY',
    'DISASTER_MANAGEMENT'
]);
exports.IncidentDomainEnum = zod_1.z.enum([
    'TRAFFIC_ACCIDENT',
    'FIRE_RESCUE',
    'MEDICAL_EMERGENCY',
    'NATURAL_DISASTER',
    'INFRASTRUCTURE_HAZARD',
    'CRIME_PUBLIC_SAFETY'
]);
exports.IncidentSeverityEnum = zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
exports.IncidentStatusEnum = zod_1.z.enum([
    'DETECTED',
    'AI_VERIFIED',
    'DISPATCHED',
    'ON_SCENE',
    'RESOLVED',
    'CLOSED'
]);
exports.UnitStatusEnum = zod_1.z.enum(['IDLE', 'ASSIGNED', 'EN_ROUTE', 'BUSY', 'OFFLINE']);
exports.IncidentSourceEnum = zod_1.z.enum(['CITIZEN_SOS', 'CCTV_STREAM', 'IOT_SENSOR']);
exports.IncidentInputSchema = zod_1.z.object({
    description: zod_1.z.string().min(3, 'Incident report must provide context'),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    source: exports.IncidentSourceEnum.default('CITIZEN_SOS'),
    category_hint: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    media_urls: zod_1.z.array(zod_1.z.string()).optional(),
    has_trapped_individuals: zod_1.z.boolean().optional(),
    has_visible_flames: zod_1.z.boolean().optional(),
    has_chemical_odor: zod_1.z.boolean().optional(),
    reporter_phone: zod_1.z.string().optional(),
    reporter_name: zod_1.z.string().optional(),
});
exports.IncidentUpdateStatusSchema = zod_1.z.object({
    status: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            const normalized = val.trim().toUpperCase().replace(/\s+/g, '_');
            if (normalized === 'EN_ROUTE' || normalized === 'EN ROUTE')
                return 'ON_SCENE';
            return normalized;
        }
        return val;
    }, exports.IncidentStatusEnum),
    unit_id: zod_1.z.string().optional(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.NearestFacilityQuerySchema = zod_1.z.object({
    lat: zod_1.z.coerce.number().min(-90).max(90),
    lng: zod_1.z.coerce.number().min(-180).max(180),
    agency: exports.AgencyTypeEnum.optional(),
    radiusMeters: zod_1.z.coerce.number().min(100).max(100000).default(5000),
});
//# sourceMappingURL=incident.js.map