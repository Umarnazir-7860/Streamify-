import jwt from 'jsonwebtoken';
import {User} from '../models/user.models.js';
import { upsertStreanUser } from '../lib/stream.js';
export async function signup(req, res) {
   let { email, password, fullName } = req.body;

// Remove extra spaces from inputs
email = email.trim();
password = password.trim();
fullName = fullName.trim();

   try {
    if (!email || !password || !fullName) {
        return res.status(400).json({ message: 'All fields are required' });
    }   
    if(password.trim().length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
   const strictEmailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|io|co)$/i;

if (!strictEmailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
}
 const existingEmail = await User.findOne({email});
 if (existingEmail){
     console.log("Email already exists, sending error response");
    return res.status(400).json({ message: 'Email already exists ,please use a different email' })};
    const index= Math.floor(Math.random() * 100)+1;
    const randomAvatar =`https://avatar.iran.liara.run/public/${index}.png`;
    const newUser =  new User({
        email,
        password,
        fullName,
        profilePic: randomAvatar
  });
 try {
  await upsertStreanUser({
    id: newUser._id.toString(),
    name: newUser.fullName,
    image: newUser.profilePic || newUser.avatar || '', // fallback if profilePic is empty
  });

  console.log(`✅ Stream user upserted successfully: ${newUser._id}`);
} catch (error) {
  console.error('❌ Error upserting Stream user:', error.message || error);
}

    await newUser.save();
    const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY, {expiresIn: '7d'});
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(201).json({
        message: 'User created successfully',
        user: {
            _id: newUser._id,
            email: newUser.email,
            fullName: newUser.fullName,
            avatar: newUser.avatar
        }
    });
   } catch (error) {
    console.log("Error in signup controller", error);
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
export async function onboard(req, res) {
 try {
   const userId = req.user._id;
   const { fullName,bio,  nativeLanguage, location, learningLanguage } = req.body;
if (!fullName || !bio || !nativeLanguage || !location || !learningLanguage) {
  return res.status(400).json({ 
    message: 'All fields are required',
    missingFields: [
      !fullName && "fullName",
      !bio && "bio",
      !nativeLanguage && "nativeLanguage",
      !learningLanguage && "learningLanguage",
      !location && "location"
    ].filter(Boolean)
  });
}
const updatedUser= await User.findByIdAndUpdate(userId,{
...req.body,
isOnboarded:true},  {new: true});
if (!updatedUser) {
  return res.status(404).json({ message: 'User not found' });
}

// Update the user in Stream
try {
  await upsertStreanUser({
    id: updatedUser._id.toString(),
    name: updatedUser.fullName,
    image: updatedUser.profilePic || '', 
  })
  console.log(`✅ Stream user updated successfully: ${updatedUser._id}`);
  
} catch (streamError) {
  console.error(' Error updating Stream user:', streamError.message || streamError);
}
res.status(200).json({
  success: true,
  message: 'User onboarded successfully',
  user: updatedUser
});

 } catch (error) {
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message || 'An unexpected error occurred'
  });
 }
}