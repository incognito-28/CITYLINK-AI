"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function errorHandler(err, _req, res, _next) {
    console.error('[UrbanShield Error]', err);
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.errors.map((e) => ({
                path: e.path.join('.'),
                message: e.message,
            })),
        });
    }
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        error: 'Emergency Core Exception',
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
}
//# sourceMappingURL=errorHandler.js.map