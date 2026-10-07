"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dispatch_controller_1 = require("../controllers/dispatch.controller");
const router = (0, express_1.Router)();
router.get('/units', dispatch_controller_1.listResponseUnits);
router.patch('/units/:id/status', dispatch_controller_1.updateResponseUnit);
router.post('/assign', dispatch_controller_1.assignUnitToIncident);
router.get('/logs', dispatch_controller_1.listDispatchLogs);
exports.default = router;
//# sourceMappingURL=dispatch.routes.js.map