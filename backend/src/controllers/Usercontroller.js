import { Usermodel } from "../models/Usermodel.js";
import bcrypt from "bcryptjs";

export const Registercontroller=async(req,res)=>{
    try {

        const {email,password,role}=req.body;

        const user=await Usermodel.findOne({email});

        if(user){
            return res.status(400).json(
                {
                    message:"User already exist with this email",
                    success:false,
                    
                }
            )
        }


        const hashpassword=await bcrypt.hash(password,10);

        const newuser=new Usermodel(
            {
                email,
                password:hashpassword,
                role
            }
        )


        const savedUser=await newuser.save();


        return res.status(200).send(
            {
                message:"User register successfully",
                success:true

            }
        )
        
    } catch (error) {
        res.status(500).send(
            {
                message:`Something wents wrong in registercontroller: ${error}`,
                success:false
            }
        )
        
    }


}