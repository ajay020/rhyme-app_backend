"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../models/user");
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // 1) Get token, check if it's there
    let token;
    if ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json("You are not logged in! please log in to get access");
    }
    // 2) Verify token
    let decoded;
    if (process.env.JWT_SECRET) {
        decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    else {
        return res.status(400).json("No Secret key found");
    }
    // 3) Check if user still exists
    const foundUser = yield user_1.User.findById(decoded.id);
    if (!foundUser) {
        return res.status(400).json("Invalid token");
    }
    // 4) Check if user changed password after the token was issued
    if (foundUser.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json("User recently changed password. Please log in again");
    }
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = foundUser;
    next();
});
exports.protect = protect;
