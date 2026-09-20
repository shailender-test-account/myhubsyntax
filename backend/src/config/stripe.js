import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-08-26.dahlia",
  appInfo: {
    name: "hubsyntax",
    version: "1.0.0",
  },
});