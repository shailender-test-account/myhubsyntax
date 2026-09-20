import express from "express";
import { protect } from "../middlewares/authmiddleware.js";
import { createConnectAccount, createDashboardLink, disconnectStripe, verifyStripeAccount } from "../controllers/stripeController.js";

const striperouter=express.Router();

striperouter.route("/connect").post(protect,createConnectAccount);
striperouter.route("/verify").get(protect,verifyStripeAccount);
striperouter.route("/disconnect").post(protect,disconnectStripe);
striperouter.route("/dashboard-link").get(protect,createDashboardLink);

export default striperouter;