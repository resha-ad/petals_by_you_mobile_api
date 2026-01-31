// routes/auth_route.js
import express from 'express';
const router = express.Router();

import asyncHandler from '../middleware/async.js';
import {
    registerUser,
    loginUser,
    getUser,
    updateUser,
    uploadProfilePicture   // ← new
} from '../controllers/auth_controller.js';

import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';   // ← our new file

// Register
router.post('/users', asyncHandler(registerUser));

// Login
router.post('/users/login', asyncHandler(loginUser));

// Get single user (protected)
router.get('/users/:id', protect, asyncHandler(getUser));

// Update user profile (protected)
router.put('/users/:id', protect, asyncHandler(updateUser));

// Upload profile picture (protected)
router.post(
    '/users/upload-profile-picture',
    protect,
    upload.single('profilePicture'),
    asyncHandler(uploadProfilePicture)
);

export default router;