"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Poem = void 0;
const mongoose_1 = require("mongoose");
const PoemSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: String
});
exports.Poem = (0, mongoose_1.model)('Poem', PoemSchema);
