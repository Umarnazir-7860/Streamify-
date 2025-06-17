import express from 'express';
import { login, logout, onboard, signup } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

router.post('/onboarding', protectRoute, upload.single('profilePic'), onboard);


router.get('/me', protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
