"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const configureDB = () => {
    mongoose_1.default.set("strictQuery", false);
    const mongodb_url = process.env.MONGODB_URL;
    if (!mongodb_url) {
        process.exit(1);
    }
    mongoose_1.default
        .connect(mongodb_url, {
    //No More Deprecation Warning Options in Mongoose 6
    //- these are no longer supported options in Mongoose 6 - only use it with old versions
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
    //useCreateIndex: true,
    //useFindAndModify: false
    })
        .then(() => {
        console.log("Connected to MONGODB");
    })
        .catch((e) => {
        console.log("Something went wrong", e);
    });
};
exports.configureDB = configureDB;
