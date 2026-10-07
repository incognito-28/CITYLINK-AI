import path from 'path';

// Configure Node.js global module resolution fallback so shared packages (@urbanshield/shared) can always find shared dependencies (like 'zod')
const serverNodeModules = path.resolve(__dirname, '..', 'node_modules');
const rootNodeModules = path.resolve(__dirname, '..', '..', 'node_modules');
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeModule = require('module');
  const globalPaths = (nodeModule && nodeModule.globalPaths) || (nodeModule && nodeModule.default && nodeModule.default.globalPaths);
  if (Array.isArray(globalPaths)) {
    if (!globalPaths.includes(serverNodeModules)) globalPaths.push(serverNodeModules);
    if (!globalPaths.includes(rootNodeModules)) globalPaths.push(rootNodeModules);
  }
} catch {
  // Fallback safely ignored if environment restricts module access
}

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';

import incidentRoutes from './routes/incident.routes';
import facilityRoutes from './routes/facility.routes';
import dispatchRoutes from './routes/dispatch.routes';
import signageRoutes from './routes/signage.routes';
import simulationRoutes from './routes/simulation.routes';
import cameraRoutes from './routes/camera.routes';
import { errorHandler } from './middlewares/errorHandler';
import { apiRateLimiter } from './middlewares/rateLimiter';
import { testAndSyncSupabase, eventBus, memoryProfiles, db } from './lib/supabaseAdmin';

const app = express();
const server = http.createServer(app);

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Enable CORS for client
app.use(
  cors({
    origin: true, // Allow all origins for the unified public access
    credentials: true,
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Global API rate limiter
app.use('/api/', apiRateLimiter);

// Health check endpoint
app.get(['/health', '/api/v1/health'], (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'UrbanShield Emergency Response Core',
    timestamp: new Date().toISOString(),
    uptime_seconds: process.uptime(),
    version: '2.0.0',
  });
});

// Demo Auth Profiles endpoint
app.get('/api/v1/auth/profiles', (_req, res) => {
  res.json({
    success: true,
    profiles: memoryProfiles,
  });
});

// REST API V1 Routes
app.use('/api/v1/incidents', incidentRoutes);
app.use('/api/v1/facilities', facilityRoutes);
app.use('/api/v1/dispatch', dispatchRoutes);
app.use('/api/v1/signage', signageRoutes);
app.use('/api/v1/simulation', simulationRoutes);
app.use('/api/v1/cameras', cameraRoutes);

// Realtime WebSocket & WebRTC Signaling Server
const wss = new WebSocketServer({ server, path: '/ws/realtime' });

const clients = new Set<WebSocket>();
// WebRTC Signaling Maps
const cameraStreamers = new Map<string, WebSocket>(); // cameraId -> Streamer Phone WS
const cameraViewers = new Map<string, Set<WebSocket>>(); // cameraId -> Set of Viewer WSs

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[UrbanShield WS] Client connected. Total active subscribers: ${clients.size}`);

  ws.send(
    JSON.stringify({
      type: 'CONNECTED',
      message: 'Connected to UrbanShield Realtime Command Mesh & WebRTC Signaling Server',
      timestamp: new Date().toISOString(),
    })
  );

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      
      switch (msg.type) {
        // Streamer (Phone) announces live camera ready
        case 'CAMERA_REGISTER_STREAM': {
          cameraStreamers.set(msg.cameraId, ws);
          await db.updateCamera(msg.cameraId, {
            status: 'ONLINE',
            is_live: true,
            gps_active: msg.latitude !== undefined,
            latitude: msg.latitude,
            longitude: msg.longitude,
            accuracy: msg.accuracy,
          });
          console.log(`[WebRTC] Phone registered camera stream: ${msg.cameraId}`);
          broadcastEvent('CAMERA_STREAM_AVAILABLE', { cameraId: msg.cameraId });
          break;
        }

        // Viewer (Command Center) requests live stream for camera
        case 'CAMERA_SUBSCRIBE_STREAM': {
          if (!cameraViewers.has(msg.cameraId)) {
            cameraViewers.set(msg.cameraId, new Set());
          }
          cameraViewers.get(msg.cameraId)!.add(ws);
          console.log(`[WebRTC] Viewer subscribed to ${msg.cameraId}`);

          // Trigger phone streamer to start offer negotiation
          const streamerWs = cameraStreamers.get(msg.cameraId);
          if (streamerWs && streamerWs.readyState === WebSocket.OPEN) {
            streamerWs.send(
              JSON.stringify({
                type: 'VIEWER_JOINED',
                cameraId: msg.cameraId,
              })
            );
          }
          break;
        }

        // WebRTC SDP Offer Relay
        case 'WEBRTC_OFFER': {
          const viewers = cameraViewers.get(msg.cameraId);
          if (viewers) {
            for (const viewerWs of viewers) {
              if (viewerWs.readyState === WebSocket.OPEN && viewerWs !== ws) {
                viewerWs.send(
                  JSON.stringify({
                    type: 'WEBRTC_OFFER',
                    cameraId: msg.cameraId,
                    sdp: msg.sdp,
                  })
                );
              }
            }
          }
          break;
        }

        // WebRTC SDP Answer Relay
        case 'WEBRTC_ANSWER': {
          const streamerWs = cameraStreamers.get(msg.cameraId);
          if (streamerWs && streamerWs.readyState === WebSocket.OPEN) {
            streamerWs.send(
              JSON.stringify({
                type: 'WEBRTC_ANSWER',
                cameraId: msg.cameraId,
                sdp: msg.sdp,
              })
            );
          }
          break;
        }

        // WebRTC ICE Candidate Relay
        case 'WEBRTC_ICE_CANDIDATE': {
          if (msg.target === 'streamer') {
            const streamerWs = cameraStreamers.get(msg.cameraId);
            if (streamerWs && streamerWs.readyState === WebSocket.OPEN) {
              streamerWs.send(JSON.stringify(msg));
            }
          } else {
            const viewers = cameraViewers.get(msg.cameraId);
            if (viewers) {
              for (const viewerWs of viewers) {
                if (viewerWs.readyState === WebSocket.OPEN && viewerWs !== ws) {
                  viewerWs.send(JSON.stringify(msg));
                }
              }
            }
          }
          break;
        }

        // Low-latency video frame relay fallback
        case 'CAMERA_FRAME_RELAY': {
          const viewers = cameraViewers.get(msg.cameraId);
          if (viewers) {
            for (const viewerWs of viewers) {
              if (viewerWs.readyState === WebSocket.OPEN) {
                viewerWs.send(
                  JSON.stringify({
                    type: 'CAMERA_FRAME_RELAY',
                    cameraId: msg.cameraId,
                    frame: msg.frame,
                    timestamp: msg.timestamp,
                  })
                );
              }
            }
          }
          break;
        }

        // Live Phone GPS watchPosition Telemetry
        case 'CAMERA_GPS_UPDATE': {
          await db.updateCamera(msg.cameraId, {
            latitude: msg.latitude,
            longitude: msg.longitude,
            accuracy: msg.accuracy,
            gps_active: true,
            status: 'ONLINE',
          });
          break;
        }

        // Stream stopped
        case 'CAMERA_STOP_STREAM': {
          cameraStreamers.delete(msg.cameraId);
          await db.setCameraOffline(msg.cameraId);
          broadcastEvent('CAMERA_STREAM_ENDED', { cameraId: msg.cameraId });
          break;
        }
      }
    } catch (e: any) {
      console.warn('[UrbanShield WS] Message handling notice:', e.message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    // Cleanup if this was a streamer with a 3-second reconnection grace period
    for (const [camId, streamerWs] of cameraStreamers.entries()) {
      if (streamerWs === ws) {
        cameraStreamers.delete(camId);
        setTimeout(() => {
          // If a new streamer connection hasn't registered in the last 3s, set offline
          if (!cameraStreamers.has(camId)) {
            db.setCameraOffline(camId);
            broadcastEvent('CAMERA_STREAM_ENDED', { cameraId: camId });
            console.log(`[WebRTC] Camera streamer disconnected and set to offline: ${camId}`);
          }
        }, 3000);
      }
    }
    // Cleanup if this was a viewer
    for (const [_camId, viewers] of cameraViewers.entries()) {
      viewers.delete(ws);
    }
    console.log(`[UrbanShield WS] Client disconnected. Total active subscribers: ${clients.size}`);
  });

  ws.on('error', (err) => {
    console.error('[UrbanShield WS] Socket error:', err.message);
  });
});

function broadcastEvent(type: string, payload: any) {
  const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Hook internal event bus to WebSocket broadcaster
eventBus.on('incident:new', (incident) => broadcastEvent('INCIDENT_CREATED', incident));
eventBus.on('incident:updated', (incident) => broadcastEvent('INCIDENT_UPDATED', incident));
eventBus.on('unit:updated', (unit) => broadcastEvent('UNIT_UPDATED', unit));
eventBus.on('dispatch:log', (log) => broadcastEvent('DISPATCH_LOG', log));
eventBus.on('camera:updated', (cam) => broadcastEvent('CAMERA_UPDATED', cam));
eventBus.on('camera:gps', (gps) => broadcastEvent('CAMERA_GPS', gps));
eventBus.on('camera:ai_event', (evt) => broadcastEvent('CAMERA_AI_DETECTION', evt));
eventBus.on('camera:ai_event_verified', (data) => broadcastEvent('CAMERA_AI_VERIFIED', data));

// Serve Frontend SPA in unified production/single public URL mode
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[UrbanShield Web] Serving static client build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // If dist not built yet, friendly root indicator with API links
  app.get('/', (_req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>UrbanShield API Core</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #090d16; color: #f1f5f9; padding: 40px; text-align: center; }
            h1 { color: #38bdf8; font-size: 2.2rem; }
            p { color: #94a3b8; font-size: 1.1rem; }
            .card { background: #131b2e; border: 1px solid #1e293b; padding: 24px; border-radius: 12px; display: inline-block; text-align: left; margin-top: 20px; }
            a { color: #38bdf8; text-decoration: none; }
            a:hover { text-decoration: underline; }
            code { background: #0f172a; padding: 3px 6px; border-radius: 4px; color: #fbbf24; }
          </style>
        </head>
        <body>
          <h1>🛡️ UrbanShield Smart City Incident Command</h1>
          <p>Backend API Core is active on port <code>${PORT}</code>.</p>
          <div class="card">
            <h3>Quick Links & Endpoints:</h3>
            <ul>
              <li><a href="/api/v1/incidents">/api/v1/incidents</a> - Active incident feed</li>
              <li><a href="/api/v1/facilities/nearest?lat=37.7749&lng=-122.4194">/api/v1/facilities/nearest</a> - Nearest facilities query</li>
              <li><a href="/api/v1/dispatch/units">/api/v1/dispatch/units</a> - Emergency vehicle fleet status</li>
              <li><a href="/api/v1/signage/active">/api/v1/signage/active</a> - Digital roadside VMS signage</li>
              <li><a href="/health">/health</a> - System health check</li>
            </ul>
            <p>To access the full React web dashboard, run: <code>npm --prefix client run dev</code> or <code>npm run build</code></p>
          </div>
        </body>
      </html>
    `);
  });
}

// Global error handler
app.use(errorHandler);

// Start server
server.listen(PORT, HOST, async () => {
  console.log('================================================================');
  console.log(`🛡️  URBANSHIELD EMERGENCY RESPONSE PLATFORM IS LIVE`);
  console.log(`📡  Server URL: http://${HOST}:${PORT}`);
  console.log(`🌐  Local Access: http://localhost:${PORT}`);
  console.log(`⚡  Realtime WebSocket: ws://localhost:${PORT}/ws/realtime`);
  console.log('================================================================');

  await testAndSyncSupabase();
});

export default app;
