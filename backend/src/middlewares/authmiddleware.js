import jwt from "jsonwebtoken";
import { Usermodel } from "../models/Usermodel.js";




export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json(
        {
            message:"Not authorized, no token provided",
            success:false
        }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Usermodel.findById(decoded.id).select("-password");

    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(
        {
            message:"Not authorized, token failed",
            success:false
        }
    )
  }
};