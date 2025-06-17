import { FriendRequest } from "../Models/friend-request.models.js";
import { User } from "../models/user.models.js";
import { Group } from "../Models/groups.models.js";
export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId).select("-password");
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // Exclude current user
        { _id: { $nin: currentUser.friends } }, // Exclude friends
        { isOnboarded: true }, // Only include onboarded users
      ],
    });
    res.status(200).json({ recommendedUsers });
  } catch (error) {
    console.error("Error fetching recommended users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id).populate(
      "friends",
      "fullName  profilePic nativeLanguage learningLanguage"
    );
    res.status(200).json(user.friends);
  } catch (error) {
    console.log("Error fetching friends:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export async function sendFriendRequest(req, res) {
  console.log("sendFriendRequest called with params:", req.params.id);
  try {
    const myId = req.user.id;
    const receiverId = req.params.id;

    if (myId === receiverId) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself." });
    }
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found." });
    }
    if (receiver.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user." });
    }
    // Check if a friend request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, receiver: receiverId },
        { sender: receiverId, receiver: myId },
      ],
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Friend request already exists." });
    }
   const friendRequest = await FriendRequest.create({
  sender: myId,
  receiver: receiverId,
  seen: false
});

// ✅ Ye line ADD karo
const populatedRequest = await friendRequest.populate(
  "sender",
  "fullName profilePic nativeLanguage learningLanguage"
);

// ✅ Ab populated result return karo
res.status(201).json({
  message: "Friend request sent successfully.",
  friendRequest: populatedRequest,
});

  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export async function acceptFriendRequest(req, res) {
  try {
    const requestId = req.params.id;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to accept the friend request",
      });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add each other to friends list
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.receiver },
    });
    await User.findByIdAndUpdate(friendRequest.receiver, {
      $addToSet: { friends: friendRequest.sender },
    });

    // ✅ Populate sender and recipient for frontend
    const populatedRequest = await friendRequest
      .populate("sender", "fullName profilePic")
      .populate("recipient", "fullName profilePic");

    res.status(200).json({
      message: "Friend request accepted successfully.",
      friendRequest: populatedRequest,
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


export async function getFriendRequests(req, res) {
  try {
  const incommingReqs = await FriendRequest.find({
  receiver: req.user.id,
  status: "pending",
}).populate("sender", "fullName profilePic nativeLanguage learningLanguage"); // ✅ required
console.log("Friend Requests Backend:", incommingReqs);

    const acceptedReqs = await FriendRequest.find({
      receiver: req.user.id,
      status: "accepted",
    }).populate("sender", "fullName profilePic");
    res.status(200).json({
      incommingReqs,
      acceptedReqs,
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePic nativeLanguage learningLanguage"
    );
    res.status(200).json(outgoingReqs);
  } catch (error) {
    console.error("Error fetching outgoing friend requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export const getUnseenFriendRequests = async (req, res) => {
  try {
    const unseenRequests = await FriendRequest.find({
      receiver: req.user._id, // ✅ FIXED
      seen: false,
    });

    res.status(200).json(unseenRequests);
  } catch (err) {
    console.error("Error fetching unseen friend requests:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const markFriendRequestsAsSeen = async (req, res) => {
  try {
    const unseenRequests = await FriendRequest.find({
      receiver: req.user._id,
      seen: false,
    }).populate("sender", "fullName profilePic"); // ✅ Populate sender

    await FriendRequest.updateMany(
      { receiver: req.user._id, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json(unseenRequests); // Now includes fullName etc.
  } catch (err) {
    console.error("❌ Error in markFriendRequestsAsSeen:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name || !members || !members.length) {
      return res.status(400).json({ message: "Name and members are required" });
    }

    // Add the creator as a member (if not already)
    const uniqueMembers = [...new Set([...members, req.user._id.toString()])];

    const group = await Group.create({
      name,
      members: uniqueMembers,
      admins: [req.user._id], // ✅ Creator is admin
      createdBy: req.user._id,
    });

    res.status(201).json(group);
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ message: "Failed to create group" });
  }
};

export const removeMember = async (req, res) => {
  const { groupId, userId } = req.params;

  const group = await Group.findById(groupId);

  if (!group) return res.status(404).json({ message: "Group not found" });

  // ✅ Check if the requestor is an admin
  if (!group.admins.includes(req.user._id.toString())) {
    return res.status(403).json({ message: "Only admins can remove members" });
  }

  group.members = group.members.filter(
    (memberId) => memberId.toString() !== userId
  );

  await group.save();
  res.status(200).json({ message: "Member removed" });
};

export const editProfile=  async (req, res) => {
    const { fullName, bio } = req.body;
    const profilePic = req.file?.path || req.user.profilePic;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, bio, profilePic },
      { new: true }
    );

   res.json({
  _id: updatedUser._id,
  fullName: updatedUser.fullName,
  bio: updatedUser.bio,
   profilePic: updatedUser.profilePic.startsWith("http")
    ? updatedUser.profilePic
    : `${BASE_URL}/${updatedUser.profilePic}`, // ✅ make it absolute
});

  }