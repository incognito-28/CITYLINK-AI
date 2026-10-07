"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.memoryProfiles = exports.eventBus = exports.supabase = void 0;
exports.testAndSyncSupabase = testAndSyncSupabase;
const supabase_js_1 = require("@supabase/supabase-js");
const geospatial_1 = require("./geospatial");
const events_1 = require("events");
const crypto_1 = __importDefault(require("crypto"));
require("dotenv/config");
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pmrbnwdhchgsbtelnwwu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtcmJud2RoY2hnc2J0ZWxud3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTM1MjE5NywiZXhwIjoyMTA2OTI4MTk3fQ.rSCvtRl0WEnMqeW9UxyWFzITZV9eYzmaldjkaGY3vug';
exports.supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});
exports.eventBus = new events_1.EventEmitter();
// Seeded In-Memory State for Instant Zero-Downtime Resilience
let memoryCameras = [
    {
        id: 'CAMERA-07',
        name: 'CITYNEXUS Mobile Live Stream #07',
        status: 'OFFLINE', // Strictly offline until real phone connects!
        latitude: null,
        longitude: null,
        accuracy: null,
        is_live: false,
        gps_active: false,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        authorized_roles: ['admin', 'operator', 'police', 'fire', 'medical', 'traffic', 'disaster', 'responder'],
    },
    {
        id: 'CAMERA-01',
        name: 'Market & 4th Fixed Surveillance',
        status: 'ONLINE',
        latitude: 37.7858,
        longitude: -122.4065,
        accuracy: 5,
        is_live: true,
        gps_active: true,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        authorized_roles: ['admin', 'operator', 'police', 'fire', 'medical', 'traffic', 'disaster', 'responder'],
    },
    {
        id: 'CAMERA-02',
        name: 'Valencia St Traffic Feed',
        status: 'ONLINE',
        latitude: 37.7645,
        longitude: -122.4215,
        accuracy: 5,
        is_live: true,
        gps_active: true,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        authorized_roles: ['admin', 'operator', 'police', 'fire', 'medical', 'traffic', 'disaster', 'responder'],
    },
];
let memoryCameraSessions = new Map();
let memoryCameraAIEvents = [];
let memoryFacilities = [
    {
        id: 'a0000001-0000-0000-0000-000000000001',
        name: 'Zuckerberg SF General Hospital & Trauma Center',
        agency: 'HEALTH_EMS',
        address: '1001 Potrero Ave, San Francisco, CA',
        latitude: 37.7557,
        longitude: -122.4048,
        contact_phone: '(415) 206-8000',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'a0000001-0000-0000-0000-000000000002',
        name: 'UCSF Medical Center at Mission Bay',
        agency: 'HEALTH_EMS',
        address: '1825 4th St, San Francisco, CA',
        latitude: 37.7681,
        longitude: -122.3912,
        contact_phone: '(415) 353-6000',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'a0000001-0000-0000-0000-000000000003',
        name: 'Saint Francis Memorial Hospital Emergency',
        agency: 'HEALTH_EMS',
        address: '900 Hyde St, San Francisco, CA',
        latitude: 37.7898,
        longitude: -122.4172,
        contact_phone: '(415) 353-6000',
        capacity_status: 'HIGH',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'a0000001-0000-0000-0000-000000000004',
        name: 'Kaiser Permanente SF Medical Center',
        agency: 'HEALTH_EMS',
        address: '2425 Geary Blvd, San Francisco, CA',
        latitude: 37.7828,
        longitude: -122.4431,
        contact_phone: '(415) 833-2000',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'a0000001-0000-0000-0000-000000000005',
        name: 'California Pacific Medical Center Van Ness',
        agency: 'HEALTH_EMS',
        address: '1101 Van Ness Ave, San Francisco, CA',
        latitude: 37.7854,
        longitude: -122.4215,
        contact_phone: '(415) 600-6000',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'b0000001-0000-0000-0000-000000000001',
        name: 'SFPD Central Police Station',
        agency: 'POLICE',
        address: '766 Vallejo St, San Francisco, CA',
        latitude: 37.7984,
        longitude: -122.4098,
        contact_phone: '(415) 315-2400',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'b0000001-0000-0000-0000-000000000002',
        name: 'SFPD Mission District Police Station',
        agency: 'POLICE',
        address: '630 Valencia St, San Francisco, CA',
        latitude: 37.7629,
        longitude: -122.422,
        contact_phone: '(415) 558-5400',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'b0000001-0000-0000-0000-000000000003',
        name: 'SFPD Northern Police Station',
        agency: 'POLICE',
        address: '1125 Fillmore St, San Francisco, CA',
        latitude: 37.7797,
        longitude: -122.4318,
        contact_phone: '(415) 614-3400',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'b0000001-0000-0000-0000-000000000004',
        name: 'SFPD Tenderloin Police Station',
        agency: 'POLICE',
        address: '301 Eddy St, San Francisco, CA',
        latitude: 37.7838,
        longitude: -122.414,
        contact_phone: '(415) 345-7300',
        capacity_status: 'HIGH',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'b0000001-0000-0000-0000-000000000005',
        name: 'SFPD Bayview District Station',
        agency: 'POLICE',
        address: '201 Williams Ave, San Francisco, CA',
        latitude: 37.7297,
        longitude: -122.3979,
        contact_phone: '(415) 671-2300',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'c0000001-0000-0000-0000-000000000001',
        name: 'SFFD Fire Station 1 (Downtown HQ)',
        agency: 'FIRE_DEPARTMENT',
        address: '935 Folsom St, San Francisco, CA',
        latitude: 37.7788,
        longitude: -122.4042,
        contact_phone: '(415) 558-3201',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'c0000001-0000-0000-0000-000000000002',
        name: 'SFFD Fire Station 2 (North Beach)',
        agency: 'FIRE_DEPARTMENT',
        address: '1340 Powell St, San Francisco, CA',
        latitude: 37.7979,
        longitude: -122.4106,
        contact_phone: '(415) 558-3202',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'c0000001-0000-0000-0000-000000000003',
        name: 'SFFD Fire Station 7 (Mission & SOMA)',
        agency: 'FIRE_DEPARTMENT',
        address: '2300 Folsom St, San Francisco, CA',
        latitude: 37.7601,
        longitude: -122.415,
        contact_phone: '(415) 558-3207',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'c0000001-0000-0000-0000-000000000004',
        name: 'SFFD Fire Station 36 (Civic Center)',
        agency: 'FIRE_DEPARTMENT',
        address: '109 Oak St, San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4211,
        contact_phone: '(415) 558-3236',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'c0000001-0000-0000-0000-000000000005',
        name: 'SFFD Fire Station 35 (Pier 22.5 Marine/HAZMAT)',
        agency: 'FIRE_DEPARTMENT',
        address: 'The Embarcadero at Pier 22.5, San Francisco, CA',
        latitude: 37.7892,
        longitude: -122.3882,
        contact_phone: '(415) 558-3235',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'd0000001-0000-0000-0000-000000000001',
        name: 'SFMTA Central Traffic Operations Command',
        agency: 'TRAFFIC_AUTHORITY',
        address: '1 South Van Ness Ave, San Francisco, CA',
        latitude: 37.7752,
        longitude: -122.419,
        contact_phone: '(415) 701-4500',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'd0000001-0000-0000-0000-000000000002',
        name: 'Caltrans District 4 Bay Operations',
        agency: 'TRAFFIC_AUTHORITY',
        address: '111 Grand Ave, Oakland, CA',
        latitude: 37.808,
        longitude: -122.2647,
        contact_phone: '(510) 286-4444',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'e0000001-0000-0000-0000-000000000001',
        name: 'SF Dept of Emergency Management (DEM HQ)',
        agency: 'DISASTER_MANAGEMENT',
        address: '1011 Turk St, San Francisco, CA',
        latitude: 37.7816,
        longitude: -122.4287,
        contact_phone: '(415) 558-3800',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'e0000001-0000-0000-0000-000000000002',
        name: 'Bill Graham Civic Emergency Shelter',
        agency: 'DISASTER_MANAGEMENT',
        address: '99 Grove St, San Francisco, CA',
        latitude: 37.7781,
        longitude: -122.4175,
        contact_phone: '(415) 554-4000',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    {
        id: 'e0000001-0000-0000-0000-000000000003',
        name: 'Moscone Disaster Relief Logistics Hub',
        agency: 'DISASTER_MANAGEMENT',
        address: '747 Howard St, San Francisco, CA',
        latitude: 37.7842,
        longitude: -122.4014,
        contact_phone: '(415) 974-4000',
        capacity_status: 'NORMAL',
        is_active: true,
        created_at: new Date().toISOString(),
    },
];
let memoryUnits = [
    {
        id: 'f0000001-0000-0000-0000-000000000001',
        unit_callsign: 'MEDIC-41 (ALS Ambulance)',
        agency: 'HEALTH_EMS',
        latitude: 37.776,
        longitude: -122.412,
        status: 'BUSY',
        assigned_incident_id: '00000000-0000-0000-0000-000000000105',
        updated_at: new Date().toISOString(),
    },
    {
        id: 'f0000001-0000-0000-0000-000000000002',
        unit_callsign: 'MEDIC-18 (Rescue Ambulance)',
        agency: 'HEALTH_EMS',
        latitude: 37.765,
        longitude: -122.418,
        status: 'IDLE',
        assigned_incident_id: null,
        updated_at: new Date().toISOString(),
    },
    {
        id: 'f0000001-0000-0000-0000-000000000003',
        unit_callsign: 'TRAUMA-9 (Mobile Intensive Care)',
        agency: 'HEALTH_EMS',
        latitude: 37.789,
        longitude: -122.408,
        status: 'IDLE',
        assigned_incident_id: null,
        updated_at: new Date().toISOString(),
    },
    {
        id: 'f0000001-0000-0000-0000-000000000004',
        unit_callsign: 'ENGINE-01 (Pumper Unit)',
        agency: 'FIRE_DEPARTMENT',
        latitude: 37.781,
        longitude: -122.406,
        status: 'ASSIGNED',
        assigned_incident_id: '00000000-0000-0000-0000-000000000102',
        updated_at: new Date().toISOString(),
    },
    {
        id: 'f0000001-0000-0000-0000-000000000005',
        unit_callsign: 'TRUCK-07 (Aerial Ladder)',
        agency: 'FIRE_DEPARTMENT',
        latitude: 37.762,
        longitude: -122.416,
        status: 'IDLE',
        assigned_incident_id: null,
        updated_at: new Date().toISOString(),
    },
    {
        id: 'f0000001-0000-0000-0000-000000000006',
        unit_callsign: 'HAZMAT-35 (Heavy Chemical Unit)',
        agency: 'FIRE_DEPARTMENT',
        latitude: 37.79,
        longitude: -122.392,
        status: 'IDLE',
        assigned_incident_id: null,
        updated_at: new Date().toISOString(),
    },
    {
        id: 'f0000001-0000-0000-0000-000000000007',
        unit_callsign: 'PATROL-104 (Interceptor)',
        agency: 'POLICE',
        latitude: 37.785,
        longitude: -122.41,
        status: 'IDLE',
        assigned_incident_id: null,
        updated_at: new Date().toISOString(),
    },
    {
        id: 'f0000001-0000-0000-0000-000000000008',
        unit_callsign: 'PATROL-208 (Rapid Response)',
        agency: 'POLICE',
        latitude: 37.772,
        longitude: -122.424,
        status: 'IDLE',
        assigned_incident_id: null,
        updated_at: new Date().toISOString(),
    },
    {
        id: 'f0000001-0000-0000-0000-000000000009',
        unit_callsign: 'K9-UNIT-03 (Tactical Perimeter)',
        agency: 'POLICE',
        latitude: 37.796,
        longitude: -122.412,
        status: 'IDLE',
        assigned_incident_id: null,
        updated_at: new Date().toISOString(),
    },
    {
        id: 'f0000001-0000-0000-0000-000000000010',
        unit_callsign: 'TRAFFIC-VAN-01 (Highway Assist)',
        agency: 'TRAFFIC_AUTHORITY',
        latitude: 37.778,
        longitude: -122.419,
        status: 'IDLE',
        assigned_incident_id: null,
        updated_at: new Date().toISOString(),
    },
    {
        id: 'f0000001-0000-0000-0000-000000000011',
        unit_callsign: 'SIGNAL-OP-04 (Grid Control)',
        agency: 'TRAFFIC_AUTHORITY',
        latitude: 37.782,
        longitude: -122.399,
        status: 'IDLE',
        assigned_incident_id: null,
        updated_at: new Date().toISOString(),
    },
    {
        id: 'f0000001-0000-0000-0000-000000000012',
        unit_callsign: 'DISASTER-CMD-01 (Mobile Post)',
        agency: 'DISASTER_MANAGEMENT',
        latitude: 37.775,
        longitude: -122.42,
        status: 'IDLE',
        assigned_incident_id: null,
        updated_at: new Date().toISOString(),
    },
];
let memoryIncidents = [
    {
        id: '00000000-0000-0000-0000-000000000101',
        title: 'Multi-Vehicle Pileup with Structural Debris on Market St',
        description: 'Two commercial trucks and one electric commuter vehicle collided at Market and 4th St. Fuel leak observed, pedestrian crosswalk obstructed.',
        source: 'CCTV_STREAM',
        domain: 'TRAFFIC_ACCIDENT',
        severity: 'CRITICAL',
        status: 'AI_VERIFIED',
        primary_agency: 'FIRE_DEPARTMENT',
        latitude: 37.7858,
        longitude: -122.4065,
        address: 'Market St & 4th St, San Francisco, CA',
        media_urls: [],
        confidence_score: 0.96,
        hazard_perimeter_meters: 180,
        citizen_advisory: 'Evacuate intersection immediately. Do not smoke or ignite flames due to diesel spillage. Detour through Mission St.',
        responder_tactical_brief: 'Dispatch Engine 1 and Hazmat 35. Foam line deployment mandatory. Block eastbound Market St at 5th St.',
        traffic_vms_text: 'MARKET ST CLOSED AT 4TH ST - FUEL SPILL - DETOUR MISSION ST',
        ai_raw_analysis: {
            title: 'Multi-Vehicle Pileup with Structural Debris on Market St',
            domain: 'TRAFFIC_ACCIDENT',
            severity: 'CRITICAL',
            primary_agency: 'FIRE_DEPARTMENT',
            confidence_score: 0.96,
            hazard_perimeter_meters: 180,
            key_hazards_detected: [
                'Diesel fuel leak',
                'Crushed battery pack',
                'Blockage of major transit artery',
            ],
            citizen_advisory: 'Evacuate intersection immediately. Do not smoke or ignite flames due to diesel spillage. Detour through Mission St.',
            responder_tactical_brief: 'Dispatch Engine 1 and Hazmat 35. Foam line deployment mandatory. Block eastbound Market St at 5th St.',
            traffic_vms_text: 'MARKET ST CLOSED AT 4TH ST - FUEL SPILL - DETOUR MISSION ST',
        },
        created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
        id: '00000000-0000-0000-0000-000000000102',
        title: 'Commercial Kitchen Grease Fire Threatening Residential Loft',
        description: 'Dense dark smoke billowing from second-floor exhaust duct. Audible fire alarm sounding, occupants self-evacuating.',
        source: 'CITIZEN_SOS',
        domain: 'FIRE_RESCUE',
        severity: 'HIGH',
        status: 'DISPATCHED',
        primary_agency: 'FIRE_DEPARTMENT',
        latitude: 37.7645,
        longitude: -122.4215,
        address: 'Valencia St & 18th St, San Francisco, CA',
        media_urls: [],
        confidence_score: 0.92,
        hazard_perimeter_meters: 120,
        citizen_advisory: 'Remain clear of Valencia St sidewalks to allow aerial ladder trucks space. Keep windows closed due to toxic smoke.',
        responder_tactical_brief: 'Truck 7 and Engine 7 en route. Check roof ventilation and ensure gas shutoff at main meter on 18th St.',
        traffic_vms_text: 'VALENCIA ST CLOSED 17TH TO 19TH - STRUCTURE FIRE - USE GUERRERO',
        assigned_unit_id: 'f0000001-0000-0000-0000-000000000004',
        created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
        id: '00000000-0000-0000-0000-000000000103',
        title: 'Flash Flood & High-Voltage Transformer Sparking on Embarcadero',
        description: 'Water main burst combined with storm drain overflow. 14 inches of water covering roadway near streetcar tracks with submerged electric junction.',
        source: 'IOT_SENSOR',
        domain: 'NATURAL_DISASTER',
        severity: 'HIGH',
        status: 'AI_VERIFIED',
        primary_agency: 'DISASTER_MANAGEMENT',
        latitude: 37.7942,
        longitude: -122.3951,
        address: 'The Embarcadero & Washington St, San Francisco, CA',
        media_urls: [],
        confidence_score: 0.89,
        hazard_perimeter_meters: 150,
        citizen_advisory: 'DO NOT STEP IN WATER. High electrocution hazard from submerged electrical boxes. Seek elevated ground.',
        responder_tactical_brief: 'Coordinate with PG&E for instant grid isolation on sector E-4. Stage high-volume water pump at Pier 3.',
        traffic_vms_text: 'EMBARCADERO FLOOD HAZARD - ELECTROCUTION RISK - AVOID WATERFRONT',
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
        id: '00000000-0000-0000-0000-000000000104',
        title: 'Suspected Chemical Leak from Freight Van near Civic Center',
        description: 'Yellowish pungent vapor escaping from abandoned delivery vehicle. 3 citizens reporting eye irritation and breathing distress.',
        source: 'CITIZEN_SOS',
        domain: 'INFRASTRUCTURE_HAZARD',
        severity: 'CRITICAL',
        status: 'AI_VERIFIED',
        primary_agency: 'FIRE_DEPARTMENT',
        latitude: 37.7795,
        longitude: -122.418,
        address: 'Polk St & Grove St, San Francisco, CA',
        media_urls: [],
        confidence_score: 0.95,
        hazard_perimeter_meters: 250,
        citizen_advisory: 'Move UPWIND towards Van Ness Ave immediately. Cover mouth and nose with a damp cloth if available.',
        responder_tactical_brief: 'Hazmat 35 deployment. Level A hazmat suits required. Establish 250m hot zone perimeter, stage decon corridor.',
        traffic_vms_text: 'HAZMAT ALERT CIVIC CENTER - MOVE UPWIND - AVOID POLK ST',
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
        id: '00000000-0000-0000-0000-000000000105',
        title: 'Mass Transit Station Escalator Crush & Medical Emergency',
        description: 'Sudden stoppage of heavy escalator during peak rush hour causing 6 pedestrian falls and suspected head trauma.',
        source: 'CITIZEN_SOS',
        domain: 'MEDICAL_EMERGENCY',
        severity: 'HIGH',
        status: 'ON_SCENE',
        primary_agency: 'HEALTH_EMS',
        latitude: 37.783,
        longitude: -122.407,
        address: 'Powell St Station Mezzanine, San Francisco, CA',
        media_urls: [],
        confidence_score: 0.91,
        hazard_perimeter_meters: 50,
        citizen_advisory: 'Station personnel guiding commuters to eastern stairwells. Do not crowd the concourse.',
        responder_tactical_brief: 'Medic 41 and Trauma 9 on scene. Triage priority given to elderly pedestrian with bleeding laceration.',
        traffic_vms_text: 'POWELL BART ENTRANCE CONGESTED - EMS RESPONDING - USE 4TH ST',
        assigned_unit_id: 'f0000001-0000-0000-0000-000000000001',
        created_at: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    },
];
let memoryDispatchLogs = [
    {
        id: '10000000-0000-0000-0000-000000000001',
        incident_id: '00000000-0000-0000-0000-000000000102',
        unit_id: 'f0000001-0000-0000-0000-000000000004',
        previous_status: 'AI_VERIFIED',
        new_status: 'DISPATCHED',
        notes: 'Engine 01 assigned by UrbanShield Automated Dispatch Matrix',
        logged_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
        id: '10000000-0000-0000-0000-000000000002',
        incident_id: '00000000-0000-0000-0000-000000000105',
        unit_id: 'f0000001-0000-0000-0000-000000000001',
        previous_status: 'DISPATCHED',
        new_status: 'ON_SCENE',
        notes: 'Medic 41 confirmed arrival on scene; triage underway',
        logged_at: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    },
];
exports.memoryProfiles = [
    {
        id: 'user-citizen-01',
        email: 'citizen@urban.shield',
        full_name: 'Alex Chen',
        role: 'citizen',
        phone: '(555) 019-2831',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'user-operator-01',
        email: 'operator@urban.shield',
        full_name: 'Cmdr. Elena Rostova',
        role: 'operator',
        agency: 'FIRE_DEPARTMENT',
        phone: '(555) 019-5432',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'user-responder-01',
        email: 'medic41@urban.shield',
        full_name: 'Paramedic Marcus Vance',
        role: 'responder',
        agency: 'HEALTH_EMS',
        phone: '(555) 019-7711',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'user-admin-01',
        email: 'admin@urban.shield',
        full_name: 'Director Sarah Jenkins',
        role: 'admin',
        phone: '(555) 019-9999',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];
let isSupabaseSynced = false;
// Attempt initial sync with Supabase Cloud
async function testAndSyncSupabase() {
    try {
        const { data, error } = await exports.supabase.from('facilities').select('id').limit(1);
        if (!error && data) {
            isSupabaseSynced = true;
            console.log('✅ [UrbanShield DB] Connected to Supabase Cloud PostGIS tables!');
            return true;
        }
    }
    catch (err) {
        // Falls back to memory cache
    }
    isSupabaseSynced = false;
    console.log('ℹ️  [UrbanShield DB] Operating in Resilient Zero-Latency High-Availability Store.');
    return false;
}
// Data Store Accessors
exports.db = {
    async getIncidents(filter) {
        if (isSupabaseSynced) {
            try {
                let q = exports.supabase.from('incidents').select('*').order('created_at', { ascending: false });
                if (filter?.status)
                    q = q.eq('status', filter.status);
                if (filter?.severity)
                    q = q.eq('severity', filter.severity);
                if (filter?.agency)
                    q = q.eq('primary_agency', filter.agency);
                const { data, error } = await q;
                if (!error && data)
                    return data;
            }
            catch (e) {
                // Fallback to memory
            }
        }
        let results = [...memoryIncidents];
        if (filter?.status)
            results = results.filter((i) => i.status === filter.status);
        if (filter?.severity)
            results = results.filter((i) => i.severity === filter.severity);
        if (filter?.agency)
            results = results.filter((i) => i.primary_agency === filter.agency);
        return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    async getIncidentById(id) {
        if (isSupabaseSynced) {
            try {
                const { data, error } = await exports.supabase.from('incidents').select('*').eq('id', id).single();
                if (!error && data)
                    return data;
            }
            catch (e) {
                // Fallback
            }
        }
        return memoryIncidents.find((i) => i.id === id) || null;
    },
    async insertIncident(incident) {
        memoryIncidents.unshift(incident);
        if (isSupabaseSynced) {
            try {
                await exports.supabase.from('incidents').insert(incident);
            }
            catch (e) {
                console.warn('[UrbanShield DB] Supabase Cloud insert sync postponed');
            }
        }
        exports.eventBus.emit('incident:new', incident);
        return incident;
    },
    async updateIncident(id, updates) {
        const idx = memoryIncidents.findIndex((i) => i.id === id);
        if (idx === -1)
            return null;
        memoryIncidents[idx] = {
            ...memoryIncidents[idx],
            ...updates,
            updated_at: new Date().toISOString(),
        };
        const updated = memoryIncidents[idx];
        if (isSupabaseSynced) {
            try {
                await exports.supabase
                    .from('incidents')
                    .update(updates)
                    .eq('id', id);
            }
            catch (e) {
                // Memory holds latest state
            }
        }
        exports.eventBus.emit('incident:updated', updated);
        return updated;
    },
    async getFacilities(query) {
        let list = [...memoryFacilities];
        if (query?.agency) {
            list = list.filter((f) => f.agency === query.agency);
        }
        if (query?.lat !== undefined && query?.lng !== undefined) {
            const origin = { latitude: query.lat, longitude: query.lng };
            list = list
                .map((f) => ({
                ...f,
                distance_meters: (0, geospatial_1.calculateDistanceMeters)(origin, {
                    latitude: f.latitude,
                    longitude: f.longitude,
                }),
            }))
                .filter((f) => query.radiusMeters ? f.distance_meters <= query.radiusMeters : true)
                .sort((a, b) => a.distance_meters - b.distance_meters);
        }
        return list;
    },
    async getUnits(query) {
        let list = [...memoryUnits];
        if (query?.agency)
            list = list.filter((u) => u.agency === query.agency);
        if (query?.status)
            list = list.filter((u) => u.status === query.status);
        if (query?.lat !== undefined && query?.lng !== undefined) {
            const origin = { latitude: query.lat, longitude: query.lng };
            list = list
                .map((u) => ({
                ...u,
                distance_meters: (0, geospatial_1.calculateDistanceMeters)(origin, {
                    latitude: u.latitude,
                    longitude: u.longitude,
                }),
            }))
                .sort((a, b) => a.distance_meters - b.distance_meters);
        }
        return list;
    },
    async updateUnit(id, updates) {
        const idx = memoryUnits.findIndex((u) => u.id === id);
        if (idx === -1)
            return null;
        memoryUnits[idx] = {
            ...memoryUnits[idx],
            ...updates,
            updated_at: new Date().toISOString(),
        };
        const updated = memoryUnits[idx];
        exports.eventBus.emit('unit:updated', updated);
        return updated;
    },
    async addDispatchLog(log) {
        const newLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            ...log,
            logged_at: new Date().toISOString(),
        };
        memoryDispatchLogs.unshift(newLog);
        exports.eventBus.emit('dispatch:log', newLog);
        return newLog;
    },
    async getDispatchLogs(incidentId) {
        if (incidentId) {
            return memoryDispatchLogs.filter((l) => l.incident_id === incidentId);
        }
        return memoryDispatchLogs;
    },
    // ==========================================
    // REAL PHONE CAMERA & WEBRTC DATA MESH
    // ==========================================
    async getCameras(role) {
        // If role is citizen, do not expose private operational cameras
        if (role === 'citizen') {
            return [];
        }
        return [...memoryCameras];
    },
    async getCameraById(id) {
        const cam = memoryCameras.find((c) => c.id === id);
        return cam || null;
    },
    async createCameraSession(cameraId = 'CAMERA-07') {
        const token = crypto_1.default.randomBytes(16).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins validity
        const session = {
            cameraId,
            token,
            expiresAt,
            qrUrl: `/camera/connect?id=${cameraId}&token=${token}`,
        };
        memoryCameraSessions.set(token, { cameraId, token, expiresAt });
        // Ensure camera entry exists in offline state if not registered
        let cam = memoryCameras.find((c) => c.id === cameraId);
        if (!cam) {
            cam = {
                id: cameraId,
                name: `CITYNEXUS Mobile Camera #${cameraId.replace('CAMERA-', '')}`,
                status: 'OFFLINE',
                latitude: null,
                longitude: null,
                accuracy: null,
                is_live: false,
                gps_active: false,
                last_updated: new Date().toISOString(),
                created_at: new Date().toISOString(),
                authorized_roles: ['admin', 'operator', 'police', 'fire', 'medical', 'traffic', 'disaster', 'responder'],
            };
            memoryCameras.push(cam);
        }
        cam.session_token = token;
        cam.token_expires_at = expiresAt;
        exports.eventBus.emit('camera:session_created', session);
        return session;
    },
    async validateCameraSession(cameraId, token) {
        const session = memoryCameraSessions.get(token);
        if (!session)
            return false;
        if (session.cameraId !== cameraId)
            return false;
        if (new Date(session.expiresAt).getTime() < Date.now()) {
            memoryCameraSessions.delete(token);
            return false;
        }
        return true;
    },
    async updateCamera(id, updates) {
        const idx = memoryCameras.findIndex((c) => c.id === id);
        if (idx === -1) {
            // create new camera
            const newCam = {
                id,
                name: `CITYNEXUS Mobile Camera #${id.replace('CAMERA-', '')}`,
                status: 'OFFLINE',
                latitude: null,
                longitude: null,
                accuracy: null,
                is_live: false,
                gps_active: false,
                last_updated: new Date().toISOString(),
                created_at: new Date().toISOString(),
                authorized_roles: ['admin', 'operator', 'police', 'fire', 'medical', 'traffic', 'disaster', 'responder'],
                ...updates,
            };
            memoryCameras.push(newCam);
            exports.eventBus.emit('camera:updated', newCam);
            return newCam;
        }
        memoryCameras[idx] = {
            ...memoryCameras[idx],
            ...updates,
            last_updated: new Date().toISOString(),
        };
        const updated = memoryCameras[idx];
        exports.eventBus.emit('camera:updated', updated);
        if (updates.latitude !== undefined || updates.longitude !== undefined) {
            exports.eventBus.emit('camera:gps', {
                cameraId: id,
                latitude: updated.latitude,
                longitude: updated.longitude,
                accuracy: updated.accuracy,
                timestamp: updated.last_updated,
            });
        }
        return updated;
    },
    async setCameraOffline(id) {
        return this.updateCamera(id, {
            status: 'OFFLINE',
            is_live: false,
            gps_active: false,
        });
    },
    async addCameraAIEvent(event) {
        memoryCameraAIEvents.unshift(event);
        exports.eventBus.emit('camera:ai_event', event);
        return event;
    },
    async getCameraAIEvents(cameraId) {
        if (cameraId) {
            return memoryCameraAIEvents.filter((e) => e.cameraId === cameraId);
        }
        return memoryCameraAIEvents;
    },
    async verifyCameraAIEvent(eventId, operatorNotes) {
        const event = memoryCameraAIEvents.find((e) => e.id === eventId);
        if (!event)
            throw new Error('AI Detection event not found');
        event.status = 'VERIFIED';
        // 1. Create verified incident from phone's real GPS coordinates
        const incidentId = crypto_1.default.randomUUID();
        const incident = {
            id: incidentId,
            title: event.aiAnalysis.title || `Accident detected by ${event.cameraId}`,
            description: `Live Camera Threat Detection via ${event.cameraId}: ${event.incidentType} (Confidence: ${Math.round(event.confidence * 100)}%). Operator verified.`,
            source: 'CCTV_STREAM',
            domain: event.aiAnalysis.domain || 'TRAFFIC_ACCIDENT',
            severity: event.aiAnalysis.severity || 'CRITICAL',
            status: 'AI_VERIFIED',
            primary_agency: event.aiAnalysis.primary_agency || 'POLICE',
            latitude: event.location.latitude,
            longitude: event.location.longitude,
            address: `Live GPS: ${event.location.latitude.toFixed(5)}, ${event.location.longitude.toFixed(5)}`,
            media_urls: event.evidenceFrame ? [event.evidenceFrame] : [],
            confidence_score: event.confidence,
            hazard_perimeter_meters: event.aiAnalysis.hazard_perimeter_meters || 150,
            citizen_advisory: event.aiAnalysis.citizen_advisory || 'Traffic obstruction reported. Emergency units en route.',
            responder_tactical_brief: event.aiAnalysis.responder_tactical_brief || 'Deploy immediate perimeter. Extrication & EMS dispatched.',
            traffic_vms_text: event.aiAnalysis.traffic_vms_text || 'ACCIDENT AHEAD - REDUCE SPEED - DETOUR ADVISED',
            ai_raw_analysis: event.aiAnalysis,
            assigned_unit_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        await this.insertIncident(incident);
        // 2. Find nearest hospital using real phone GPS
        const nearestHospitals = await this.getFacilities({
            lat: event.location.latitude,
            lng: event.location.longitude,
            agency: 'HEALTH_EMS',
            radiusMeters: 50000,
        });
        const targetHospital = nearestHospitals[0] || null;
        // 3. Find nearest available ambulance
        const availableAmbulances = await this.getUnits({
            agency: 'HEALTH_EMS',
            status: 'IDLE',
            lat: event.location.latitude,
            lng: event.location.longitude,
        });
        const nearestAmbulance = availableAmbulances[0] || null;
        if (nearestAmbulance) {
            await this.updateUnit(nearestAmbulance.id, {
                status: 'ASSIGNED',
                assigned_incident_id: incidentId,
            });
            await this.updateIncident(incidentId, {
                status: 'DISPATCHED',
                assigned_unit_id: nearestAmbulance.id,
            });
        }
        // 4. Record in dispatch audit log
        await this.addDispatchLog({
            incident_id: incidentId,
            unit_id: nearestAmbulance?.id || null,
            previous_status: 'DETECTED',
            new_status: nearestAmbulance ? 'DISPATCHED' : 'AI_VERIFIED',
            notes: `Verified incident from ${event.cameraId}. Routed to POLICE, MEDICAL, and TRAFFIC. ${targetHospital ? `Target Hospital: ${targetHospital.name} (${targetHospital.distance_meters}m).` : ''} ${operatorNotes || ''}`,
        });
        exports.eventBus.emit('camera:ai_event_verified', { event, incident, hospital: targetHospital, unit: nearestAmbulance });
        return { incident, event };
    },
};
//# sourceMappingURL=supabaseAdmin.js.map