import express from "express";
import { Registercontroller } from "../controllers/Usercontroller.js";
import { Logincontroller } from "../controllers/Logincontroller.js";
import { logout } from "../controllers/Logoutcontroller.js";
import { protect } from "../middlewares/authmiddleware.js";
import { getMe } from "../controllers/Getmecontroller.js";

const userRouter=express.Router();

userRouter.route("/register").post(Registercontroller);
userRouter.route("/login").post(Logincontroller);
userRouter.route("/logout").post(logout)
userRouter.route("/me").get(protect,getMe)

export default userRouter;