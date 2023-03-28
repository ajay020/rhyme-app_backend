"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = void 0;
const notFoundMiddleware = (req, res, next) => {
    const message = "Resource Not found";
    res.status(404).send(message);
};
exports.notFoundMiddleware = notFoundMiddleware;
