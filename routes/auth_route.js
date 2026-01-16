import express from 'express';
const router = express.Router();

import asyncHandler from '../middleware/async.js';
import { registerUser, loginUser } from '../controllers/auth_controller.js';

// Register
router.post('/users', asyncHandler(registerUser));

// Login
router.post('/users/login', asyncHandler(loginUser));

export default router;