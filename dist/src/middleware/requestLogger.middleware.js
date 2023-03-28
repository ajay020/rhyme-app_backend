"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const requestLogger = (req, res, next) => {
    // console.log(`${req.method} url:: ${req.url}`);
    next();
};
exports.requestLogger = requestLogger;
