import { SupabaseClient } from '@supabase/supabase-js';
import { IncidentRecord, FacilityRecord, ResponseUnitRecord, DispatchLogRecord, UserProfileRecord, CameraRecord, CameraSession, CameraAIEvent, UserRole } from '@urbanshield/shared';
import { EventEmitter } from 'events';
import 'dotenv/config';
export declare const supabase: SupabaseClient;
export declare const eventBus: EventEmitter<[never]>;
export declare const memoryProfiles: UserProfileRecord[];
export declare function testAndSyncSupabase(): Promise<boolean>;
export declare const db: {
    getIncidents(filter?: {
        status?: string;
        severity?: string;
        agency?: string;
    }): Promise<IncidentRecord[]>;
    getIncidentById(id: string): Promise<IncidentRecord | null>;
    insertIncident(incident: IncidentRecord): Promise<IncidentRecord>;
    updateIncident(id: string, updates: Partial<IncidentRecord>): Promise<IncidentRecord | null>;
    getFacilities(query?: {
        lat?: number;
        lng?: number;
        agency?: string;
        radiusMeters?: number;
    }): Promise<FacilityRecord[]>;
    getUnits(query?: {
        agency?: string;
        status?: string;
        lat?: number;
        lng?: number;
    }): Promise<ResponseUnitRecord[]>;
    updateUnit(id: string, updates: Partial<ResponseUnitRecord>): Promise<ResponseUnitRecord | null>;
    addDispatchLog(log: Omit<DispatchLogRecord, "id" | "logged_at">): Promise<DispatchLogRecord>;
    getDispatchLogs(incidentId?: string): Promise<DispatchLogRecord[]>;
    getCameras(role?: UserRole): Promise<CameraRecord[]>;
    getCameraById(id: string): Promise<CameraRecord | null>;
    createCameraSession(cameraId?: string): Promise<CameraSession>;
    validateCameraSession(cameraId: string, token: string): Promise<boolean>;
    updateCamera(id: string, updates: Partial<CameraRecord>): Promise<CameraRecord | null>;
    setCameraOffline(id: string): Promise<CameraRecord | null>;
    addCameraAIEvent(event: CameraAIEvent): Promise<CameraAIEvent>;
    getCameraAIEvents(cameraId?: string): Promise<CameraAIEvent[]>;
    verifyCameraAIEvent(eventId: string, operatorNotes?: string): Promise<{
        incident: IncidentRecord;
        event: CameraAIEvent;
    }>;
};
//# sourceMappingURL=supabaseAdmin.d.ts.map