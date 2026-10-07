"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const simulation_controller_1 = require("../controllers/simulation.controller");
const router = (0, express_1.Router)();
router.post('/seed-feed', simulation_controller_1.seedSimulationFeed);
exports.default = router;
//# sourceMappingURL=simulation.routes.js.map