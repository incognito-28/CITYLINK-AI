"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const signage_controller_1 = require("../controllers/signage.controller");
const router = (0, express_1.Router)();
router.get('/active', signage_controller_1.getActiveSignage);
exports.default = router;
//# sourceMappingURL=signage.routes.js.map