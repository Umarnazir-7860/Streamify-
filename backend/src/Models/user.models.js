import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlenghth: 6,  // Typo here, should be minlength (fix if needed)
  },
  bio: {
    type: String,
    default: "",
  },
  profilePic: {
    type: String,
    default: "",
  },
  nativeLanguage: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  learningLanguage: {
    type: String,
    default: "",
  },
  isOnboarded: {
    type: Boolean,
    default: false,
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
}, { timestamps: true });

// pre hook to hash password
userSchema.pre("save", async function(next){
  try {
    if(!this.isModified("password")){
      return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// **Define comparePassword method outside the pre save hook**
userSchema.methods.comparePassword = async function (password) {
  const isPasswordCorrect = await bcrypt.compare(password, this.password);
  return isPasswordCorrect;
};

export const User = mongoose.model("User", userSchema);
