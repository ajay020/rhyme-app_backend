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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePoem = exports.updatePoem = exports.createPoem = exports.getPoemById = exports.getAllPoems = void 0;
const poem_1 = require("../models/poem");
const getAllPoems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const poems = yield poem_1.Poem.find().populate("author");
        return res.status(200).json(poems);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.getAllPoems = getAllPoems;
// Get poem by id
const getPoemById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const poemId = req.params.id;
        if (!poemId) {
            return res.status(404).json("Resource not found");
        }
        const poem = yield poem_1.Poem.findById(poemId).populate("author");
        return res.status(200).json(poem);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.getPoemById = getPoemById;
const createPoem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const poem = new poem_1.Poem(Object.assign({ author: req.user._id }, req.body));
        const newPoem = yield poem.save();
        return res.status(200).json(newPoem);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.createPoem = createPoem;
const updatePoem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const poemId = req.params.id;
        const newUpdate = req.body;
        const currUser = req.user;
        let poem = yield poem_1.Poem.findById(poemId);
        if (!poem) {
            return res.status(404).json("Resource not found");
        }
        if (currUser.id !== ((_a = poem.author) === null || _a === void 0 ? void 0 : _a._id.toString())) {
            return res.status(403).json("You can't delete others poem.");
        }
        poem = Object.assign(poem, newUpdate);
        let savedPoem = yield poem.save();
        return res.status(200).json(savedPoem);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});
exports.updatePoem = updatePoem;
const deletePoem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const id = req.params.id;
        const currUser = req.user;
        const poem = yield poem_1.Poem.findById(id);
        if (!poem) {
            return res.status(404).json("No poem found with this id " + id);
        }
        if (currUser.id !== ((_c = (_b = poem.author) === null || _b === void 0 ? void 0 : _b._id) === null || _c === void 0 ? void 0 : _c.toString())) {
            return res.status(403).json("You can't delete others poem.");
        }
        yield poem_1.Poem.findByIdAndDelete(id);
        res.status(200).json("Poem deleted");
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.deletePoem = deletePoem;
