"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facility_controller_1 = require("../controllers/facility.controller");
const router = (0, express_1.Router)();
router.get('/nearest', facility_controller_1.getNearestFacilities);
router.get('/', facility_controller_1.listAllFacilities);
exports.default = router;
//# sourceMappingURL=facility.routes.js.map