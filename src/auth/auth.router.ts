import express from "express";
import { protect } from "../middleware/protect.middleware";
export const authRouter = express.Router();
import * as authController from "./auth.controller";

authRouter.post("/signup", authController.signup);
authRouter.post("/login", authController.login);

authRouter.post("/forgotPassword", authController.forgotPassword);
authRouter.patch("/resetPassword/:token", authController.resetPassword);

authRouter.patch("/updatePassword", protect, authController.updatePassword);
authRouter.patch("/updateMe", protect, authController.updateMe);
authRouter.delete("/deleteMe", protect, authController.deleteMe);
