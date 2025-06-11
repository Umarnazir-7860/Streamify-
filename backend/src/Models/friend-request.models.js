import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    seen: {
      type: Boolean,
      default: false, // 👈 this is what enables unseen notification tracking
    }
  },
  {
    timestamps: true,
  }
);

export const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
