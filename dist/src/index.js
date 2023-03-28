"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const error_middleware_1 = require("./middleware/error.middleware");
const not_found_middleware_1 = require("./middleware/not-found.middleware");
const requestLogger_middleware_1 = require("./middleware/requestLogger.middleware");
const db_1 = require("./config/db");
const poem_router_1 = require("./poem/poem.router");
const auth_router_1 = require("./auth/auth.router");
const app = (0, express_1.default)();
dotenv_1.default.config();
(0, db_1.configureDB)();
if (!process.env.PORT) {
    process.exit(1);
}
const PORT = parseInt(process.env.PORT, 10) || 8000;
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)()); // set security HTTP headers,
app.use(express_1.default.json({ limit: "10kb" })); //limit the body size
app.use(express_1.default.json());
app.use(requestLogger_middleware_1.requestLogger);
app.use("/api/poem", poem_router_1.poemRouter);
app.use("/api/auth", auth_router_1.authRouter);
app.use(error_middleware_1.errorHandler);
app.use(not_found_middleware_1.notFoundMiddleware);
/** Server Activation */
app.listen(PORT, () => console.log("Server started on PORT " + PORT));
module.exports = app;
