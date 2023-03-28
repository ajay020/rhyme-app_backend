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
exports.deleteMe = exports.updateMe = exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.login = exports.signup = exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_1 = require("../models/user");
const email_1 = require("./email");
exports.authRouter = express_1.default.Router();
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        const newUser = yield user_1.User.create(userData);
        const token = generateToken(newUser._id);
        res.status(201).json({
            status: "success",
            token,
            data: {
                user: newUser,
            },
        });
    }
    catch (error) {
        res.status(500).json(error.message);
    }
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // check if email and password exists
        if (!email || !password) {
            return res.status(400).json("Please provide email and password");
        }
        // Check if user exists and password is correct
        const user = yield user_1.User.findOne({ email }).select("+password");
        if (!user || !(yield user.correctPassword(password, user.password))) {
            return res.status(400).json("Incorrect email or password");
        }
        // If everything is ok, send token to client
        const token = generateToken(user._id);
        res.status(200).json({
            status: "success",
            token,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json(error.message);
    }
});
exports.login = login;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user based on POSTed email
    const user = yield user_1.User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json("There is no user with that email address.");
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    yield user.save({ validateBeforeSave: false });
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and
   passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email.`;
    try {
        yield (0, email_1.sendEmail)({
            email: user.email,
            subject: "Your password reset token (valid for 10 minutes)",
            message,
        });
        res.status(200).json({
            status: "success",
            message: "Token sent to email",
        });
    }
    catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        yield user.save({ validateBeforeSave: false });
        console.log(error.message);
        return res
            .status(500)
            .json("There was an error sending the email. Try again later!");
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1) Get user based on the token
        const hashedToken = crypto_1.default
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");
        const user = yield user_1.User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });
        // 2) Set the new password, so long as there is a user and the token has not expired
        if (!user) {
            return res.status(400).json("Token is invalid or has expired.");
        }
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        yield user.save();
        // 3) Update the changedPasswordAT property for the user
        /*-- Done in user model!*/
        // 4) Log the user in, send JWT
        createSendToken(req.user, 200, res);
    }
    catch (error) {
        res.status(500).json(error.message);
    }
});
exports.resetPassword = resetPassword;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1) Get user from collection
        const user = yield user_1.User.findById(req.user.id).select("+password");
        if (!user) {
            return res.status(404).json("User not found");
        }
        // 2) Check if posted password is correct
        if (!(yield user.correctPassword(req.body.passwordCurrent, user.password))) {
            return res
                .status(401)
                .json("Inputted password does not match current password.");
        }
        // 3) If so, update password
        user.password = req.body.newPassword;
        user.save();
        // 4) Log user in, send JWT
        const token = generateToken(user._id);
        res.status(200).json({
            status: "success",
            token: token,
        });
    }
    catch (error) {
        res.status(500).json(error.message);
    }
});
exports.updatePassword = updatePassword;
const updateMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1) Create error if user POSTS password data
        if (req.body.password || req.body.passwordConfirm) {
            return res.status(400).json("This route is not for password updates!");
        }
        // 2) Filter out unwanted field names
        // const filteredBody = filterObj(req.body, "name", "email");
        // 3) Update user document
        const updatedUser = yield user_1.User.findByIdAndUpdate(req.user.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: "success",
            data: {
                user: updatedUser,
            },
        });
    }
    catch (error) {
        res.status(500).json(error.message);
    }
});
exports.updateMe = updateMe;
const deleteMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_1.User.findByIdAndUpdate(req.user.id, { active: false });
        res.status(204).json({
            status: "success",
            data: null,
        });
    }
    catch (error) {
        res.status(500).json("Couldn't delete, something went wrong!");
    }
});
exports.deleteMe = deleteMe;
// generate token
function generateToken(id) {
    if (!process.env.JWT_SECRET) {
        return null;
    }
    const token = jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN, // set to 90d for 90 days
    });
    return token;
}
const createSendToken = (user, statusCode, res) => {
    const token = generateToken(user._id);
    // send token in cookies
    const JWT_COOKIE_EXPIRES_IN = 90; // 90 days
    const cookieOptions = {
        expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false,
    };
    if (process.env.NODE_ENV === "production")
        cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);
};
// const filterObj = (obj: Partial<IUser>, ...allowedFields: string[]) => {
//   let newObj: Partial<IUser> = {};
//   Object.keys(obj).forEach((el) => {
//     if (allowedFields.includes(el)) {
//       newObj[el as keyof typeof newObj] = obj[el as keyof typeof obj];
//     }
//   });
//   return newObj;
// };
