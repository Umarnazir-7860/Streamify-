import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    console.log("Token from cookie:", token);  // Check if token is received

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Decoded token:", decoded);  // Check decoded token

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    console.log("Authenticated user:", user);  // Check user found or not

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
