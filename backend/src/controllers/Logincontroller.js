import { Usermodel } from "../models/Usermodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
export const Logincontroller = async (req, res) => {
    try {

        const { email, password, role } = req.body;

        const user = await Usermodel.findOne({ email });

        if (!user) {
            return res.status(201).json(
                {
                    message: "User not found please register now",
                  
                    success: false,

                }
            )
        }


        const ispassworrdvalid = await bcrypt.compare(password, user.password);

        if (!ispassworrdvalid) {
            return res.status(201).send(
                {
                    message: "Invalid credentials",
                    success: false

                }
            )
        }

        const tokendata = {
            id: user._id,
            email: user.email,
            role: user.role
        }



        const accesstoken = jwt.sign(
            tokendata,
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )


        res.cookie("token", accesstoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });


        return res.status(200).send(
            {
                message:"User login succsessfully",
                success:true,
                user
            }
        )













    } catch (error) {
        res.status(500).send(
            {
                message: `Something wents wrong in registercontroller: ${error}`,
                success: false
            }
        )

    }


}