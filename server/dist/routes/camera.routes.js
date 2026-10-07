"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const camera_controller_1 = require("../controllers/camera.controller");
const router = (0, express_1.Router)();
router.get('/', camera_controller_1.listCameras);
router.get('/events/ai', camera_controller_1.getCameraAIEvents);
router.post('/events/verify', camera_controller_1.verifyCameraIncident);
router.post('/session', camera_controller_1.createCameraSession);
router.post('/register', camera_controller_1.registerCamera);
router.get('/:id', camera_controller_1.getCameraById);
router.post('/:id/gps', camera_controller_1.updateCameraGPS);
router.post('/:id/status', camera_controller_1.setCameraOffline);
router.post('/:id/analyze', camera_controller_1.analyzeCameraFrame);
exports.default = router;
//# sourceMappingURL=camera.routes.js.map