import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createGroup, removeMember } from "../controllers/user.controller.js";

const router = express.Router();
router.use(protectRoute);

router.post("/create", createGroup);
router.delete("/:groupId/remove/:userId", removeMember); // ✅ Admin route

export default router;
