import { z } from 'zod';
export declare const UserRoleEnum: z.ZodEnum<["citizen", "operator", "responder", "admin", "police", "fire", "medical", "traffic", "disaster"]>;
export type UserRole = z.infer<typeof UserRoleEnum>;
export declare const AgencyTypeEnum: z.ZodEnum<["POLICE", "FIRE_DEPARTMENT", "HEALTH_EMS", "TRAFFIC_AUTHORITY", "DISASTER_MANAGEMENT"]>;
export type AgencyType = z.infer<typeof AgencyTypeEnum>;
export declare const IncidentDomainEnum: z.ZodEnum<["TRAFFIC_ACCIDENT", "FIRE_RESCUE", "MEDICAL_EMERGENCY", "NATURAL_DISASTER", "INFRASTRUCTURE_HAZARD", "CRIME_PUBLIC_SAFETY"]>;
export type IncidentDomain = z.infer<typeof IncidentDomainEnum>;
export declare const IncidentSeverityEnum: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
export type IncidentSeverity = z.infer<typeof IncidentSeverityEnum>;
export declare const IncidentStatusEnum: z.ZodEnum<["DETECTED", "AI_VERIFIED", "DISPATCHED", "ON_SCENE", "RESOLVED", "CLOSED"]>;
export type IncidentStatus = z.infer<typeof IncidentStatusEnum>;
export declare const UnitStatusEnum: z.ZodEnum<["IDLE", "ASSIGNED", "EN_ROUTE", "BUSY", "OFFLINE"]>;
export type UnitStatus = z.infer<typeof UnitStatusEnum>;
export declare const IncidentSourceEnum: z.ZodEnum<["CITIZEN_SOS", "CCTV_STREAM", "IOT_SENSOR"]>;
export type IncidentSource = z.infer<typeof IncidentSourceEnum>;
export declare const IncidentInputSchema: z.ZodObject<{
    description: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    source: z.ZodDefault<z.ZodEnum<["CITIZEN_SOS", "CCTV_STREAM", "IOT_SENSOR"]>>;
    category_hint: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    media_urls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    has_trapped_individuals: z.ZodOptional<z.ZodBoolean>;
    has_visible_flames: z.ZodOptional<z.ZodBoolean>;
    has_chemical_odor: z.ZodOptional<z.ZodBoolean>;
    reporter_phone: z.ZodOptional<z.ZodString>;
    reporter_name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    latitude: number;
    longitude: number;
    source: "CITIZEN_SOS" | "CCTV_STREAM" | "IOT_SENSOR";
    category_hint?: string | undefined;
    title?: string | undefined;
    address?: string | undefined;
    media_urls?: string[] | undefined;
    has_trapped_individuals?: boolean | undefined;
    has_visible_flames?: boolean | undefined;
    has_chemical_odor?: boolean | undefined;
    reporter_phone?: string | undefined;
    reporter_name?: string | undefined;
}, {
    description: string;
    latitude: number;
    longitude: number;
    source?: "CITIZEN_SOS" | "CCTV_STREAM" | "IOT_SENSOR" | undefined;
    category_hint?: string | undefined;
    title?: string | undefined;
    address?: string | undefined;
    media_urls?: string[] | undefined;
    has_trapped_individuals?: boolean | undefined;
    has_visible_flames?: boolean | undefined;
    has_chemical_odor?: boolean | undefined;
    reporter_phone?: string | undefined;
    reporter_name?: string | undefined;
}>;
export type IncidentInput = z.infer<typeof IncidentInputSchema>;
export declare const IncidentUpdateStatusSchema: z.ZodObject<{
    status: z.ZodEffects<z.ZodEnum<["DETECTED", "AI_VERIFIED", "DISPATCHED", "ON_SCENE", "RESOLVED", "CLOSED"]>, "DETECTED" | "AI_VERIFIED" | "DISPATCHED" | "ON_SCENE" | "RESOLVED" | "CLOSED", unknown>;
    unit_id: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "DETECTED" | "AI_VERIFIED" | "DISPATCHED" | "ON_SCENE" | "RESOLVED" | "CLOSED";
    unit_id?: string | undefined;
    notes?: string | undefined;
}, {
    status?: unknown;
    unit_id?: string | undefined;
    notes?: string | undefined;
}>;
export type IncidentUpdateStatus = z.infer<typeof IncidentUpdateStatusSchema>;
export declare const NearestFacilityQuerySchema: z.ZodObject<{
    lat: z.ZodNumber;
    lng: z.ZodNumber;
    agency: z.ZodOptional<z.ZodEnum<["POLICE", "FIRE_DEPARTMENT", "HEALTH_EMS", "TRAFFIC_AUTHORITY", "DISASTER_MANAGEMENT"]>>;
    radiusMeters: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    lat: number;
    lng: number;
    radiusMeters: number;
    agency?: "POLICE" | "FIRE_DEPARTMENT" | "HEALTH_EMS" | "TRAFFIC_AUTHORITY" | "DISASTER_MANAGEMENT" | undefined;
}, {
    lat: number;
    lng: number;
    agency?: "POLICE" | "FIRE_DEPARTMENT" | "HEALTH_EMS" | "TRAFFIC_AUTHORITY" | "DISASTER_MANAGEMENT" | undefined;
    radiusMeters?: number | undefined;
}>;
export type NearestFacilityQuery = z.infer<typeof NearestFacilityQuerySchema>;
export interface AITriageAnalysis {
    title: string;
    domain: IncidentDomain;
    severity: IncidentSeverity;
    primary_agency: AgencyType;
    confidence_score: number;
    hazard_perimeter_meters: number;
    key_hazards_detected: string[];
    citizen_advisory: string;
    responder_tactical_brief: string;
    traffic_vms_text: string;
}
export interface IncidentRecord {
    id: string;
    reporter_id?: string | null;
    title: string;
    description: string;
    source: IncidentSource;
    domain: IncidentDomain;
    severity: IncidentSeverity;
    status: IncidentStatus;
    primary_agency: AgencyType;
    latitude: number;
    longitude: number;
    address?: string | null;
    media_urls: string[];
    ai_raw_analysis?: AITriageAnalysis | null;
    citizen_advisory?: string | null;
    responder_tactical_brief?: string | null;
    traffic_vms_text?: string | null;
    confidence_score?: number | null;
    hazard_perimeter_meters: number;
    assigned_unit_id?: string | null;
    created_at: string;
    updated_at: string;
}
export interface FacilityRecord {
    id: string;
    name: string;
    agency: AgencyType;
    address: string;
    latitude: number;
    longitude: number;
    contact_phone: string;
    capacity_status: 'NORMAL' | 'HIGH' | 'CRITICAL_OVERFLOW';
    is_active: boolean;
    distance_meters?: number;
    created_at: string;
}
export interface ResponseUnitRecord {
    id: string;
    unit_callsign: string;
    agency: AgencyType;
    latitude: number;
    longitude: number;
    status: UnitStatus;
    assigned_incident_id?: string | null;
    distance_meters?: number;
    updated_at: string;
}
export interface DispatchLogRecord {
    id: string;
    incident_id: string;
    unit_id?: string | null;
    actor_id?: string | null;
    previous_status?: IncidentStatus | null;
    new_status: IncidentStatus;
    notes?: string | null;
    logged_at: string;
}
export interface UserProfileRecord {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    agency?: AgencyType | null;
    phone?: string | null;
    created_at: string;
    updated_at: string;
}
export interface CameraRecord {
    id: string;
    name: string;
    status: 'ONLINE' | 'OFFLINE';
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    is_live: boolean;
    gps_active: boolean;
    last_updated: string;
    created_at: string;
    session_token?: string;
    token_expires_at?: string;
    authorized_roles: UserRole[];
    evidence_frame_url?: string | null;
    current_incident_id?: string | null;
}
export interface CameraSession {
    cameraId: string;
    token: string;
    expiresAt: string;
    qrUrl: string;
}
export interface CameraAIEvent {
    id: string;
    cameraId: string;
    timestamp: string;
    incidentType: string;
    confidence: number;
    evidenceFrame: string;
    location: {
        latitude: number;
        longitude: number;
        accuracy?: number;
    };
    status: 'AWAITING_VERIFICATION' | 'VERIFIED' | 'DISMISSED';
    aiAnalysis: AITriageAnalysis;
}
//# sourceMappingURL=incident.d.ts.map