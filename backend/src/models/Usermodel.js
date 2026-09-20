import mongoose from "mongoose";

const Userschema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true
        },

        password: {
            type: String,
            required: [true, "Password is required"],

        },

        stripeAccountId: {
            type: String,
            default: null,
        },
        stripeConnected: {
            type: Boolean,
            default: false,
        },

        role: {
            type: String,
            required: true,
            enum: ["Admin", "User"]

        },

        isverified: {
            type: Boolean,
            default: false
        },

        isadmin: {
            type: Boolean,
            default: false
        }
    }
)


export const Usermodel = mongoose.model("user", Userschema);