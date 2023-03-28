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
exports.sendEmail = void 0;
// import nodemailer from "nodemailer";
const nodemailer = require("nodemailer");
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    // 2) Define the email options
    const mailOptions = {
        from: "support@rhyme.com",
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    // 3) Actually send the email
    yield transporter.sendMail(mailOptions);
});
exports.sendEmail = sendEmail;
