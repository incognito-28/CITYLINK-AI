"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRateLimiter = exports.analyzeRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.analyzeRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 500, // allow high throughput for emergency testing
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === 'localhost',
    message: {
        status: 429,
        message: 'Too many emergency intake submissions from this IP. Please wait before submitting another report.',
    },
});
exports.apiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 20000, // accommodate frequent polling across cameras, telemetry, and multiple portals
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === 'localhost',
});
//# sourceMappingURL=rateLimiter.js.map