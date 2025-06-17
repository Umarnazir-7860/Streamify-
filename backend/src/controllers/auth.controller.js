import jwt from 'jsonwebtoken';
import {User} from '../models/user.models.js';
import { upsertStreanUser } from '../lib/stream.js';

// === Name-based fallback avatar ===
function generateInitialsAvatar(fullName) {
  const name = fullName.trim();
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
  const bgColor = stringToColor(name);
  return `https://dummyimage.com/100x100/${bgColor.slice(1)}/fff&text=${initials}`;
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += (`00${value.toString(16)}`).substr(-2);
  }
  return color;
}

// === Signup Controller ===
export async function signup(req, res) {
  let { email, password, fullName } = req.body;

  // Clean inputs
  email = email.trim();
  password = password.trim();
  fullName = fullName.trim();

  try {
    // Basic validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long' });
    }

    const strictEmailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|io|co)$/i;
    if (!strictEmailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: 'Email already exists, please use a different one' });
    }

    // === Handle profilePic ===
    let profilePic = '';
    if (req.file && req.file.path) {
      // Image uploaded via Cloudinary
      profilePic = req.file.path;
    } else {
      // No image → fallback avatar
      profilePic = generateInitialsAvatar(fullName);
    }

    // === Create user ===
    const newUser = new User({
      email,
      password,
      fullName,
      profilePic,
    });

    // === Upsert to Stream ===
    try {
      await upsertStreanUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || '',
      });
      console.log(`✅ Stream user upserted: ${newUser._id}`);
    } catch (error) {
      console.error('❌ Stream user upsert error:', error.message || error);
    }

    // Save in DB
    await newUser.save();

    // === Create and send JWT ===
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '7d',
    });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
      },
    });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
export async function login(req, res) {
  try {
    let { email, password } = req.body;

    // Trim inputs
    email = email.trim();
    password = password.trim();

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId:user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '7d',
    });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.log("Error in login controller", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export function logout(req, res) {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.status(200).json({ message: 'Logged out successfully' });
}
export const onboard = async (req, res) => {
  try {
    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

    const profilePic = req.file ? req.file.path : null;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName,
        bio,
        nativeLanguage,
        learningLanguage,
        location,
        profilePic,
        isOnboarded: true,
      },
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "Onboarding successful", user });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

