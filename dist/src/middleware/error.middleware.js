"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).send(err.message);
};
exports.errorHandler = errorHandler;
