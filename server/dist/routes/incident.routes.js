"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const incident_controller_1 = require("../controllers/incident.controller");
const upload_1 = require("../middlewares/upload");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
router.post('/analyze', rateLimiter_1.analyzeRateLimiter, upload_1.uploadMedia.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
]), incident_controller_1.analyzeAndCreateIncident);
router.get('/', incident_controller_1.listIncidents);
router.get('/:id', incident_controller_1.getIncidentById);
router.patch('/:id/status', incident_controller_1.updateIncidentStatus);
exports.default = router;
//# sourceMappingURL=incident.routes.js.map