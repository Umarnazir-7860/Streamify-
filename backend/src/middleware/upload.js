import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../lib/cloudinary.js';

// Cloudinary storage settings
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'language-app-profiles', // you can change this folder name
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  },
});

// Multer middleware
export const upload = multer({ storage });
