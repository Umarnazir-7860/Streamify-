import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
  getUnseenFriendRequests,
  markFriendRequestsAsSeen
} from "../controllers/user.controller.js";
const router = express.Router();
router.use(protectRoute);
router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friends-requests", getOutgoingFriendReqs);
router.get("/unseen-friend-requests", getUnseenFriendRequests); // ✅ Step 1
router.put("/friend-requests/mark-seen", markFriendRequestsAsSeen);
export default router;
