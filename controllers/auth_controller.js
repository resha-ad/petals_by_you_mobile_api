import asyncHandler from '../middleware/async.js';
import User from '../models/user_model.js';
import fs from 'fs'; // needed for unlinkSync in upload

// Register user
export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, username, phoneNumber } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Full name, email and password are required',
        });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
        return res.status(400).json({
            success: false,
            message: 'Email already exists',
        });
    }

    if (username) {
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({
                success: false,
                message: 'Username already taken',
            });
        }
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username || undefined,
        phoneNumber: phoneNumber || undefined,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
        success: true,
        data: userResponse,
    });
});

// Login user
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password',
        });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
        });
    }

    const token = user.getSignedJwtToken();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
        success: true,
        token,
        data: userResponse,
    });
});

// Upload profile picture
export const uploadProfilePicture = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Please upload an image file',
        });
    }

    if (req.file.size > 5 * 1024 * 1024) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
            success: false,
            message: 'Image too large (max 5MB)',
        });
    }

    res.status(200).json({
        success: true,
        data: req.file.filename,
        message: 'Profile picture uploaded successfully',
    });
});

// Update user profile
export const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user._id.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const {
        fullName,
        username,
        phoneNumber,
        address,
        dateOfBirth,
        preferredDeliveryTime,
        profilePicture
    } = req.body;

    if (fullName) user.fullName = fullName;
    if (username) user.username = username;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (preferredDeliveryTime) user.preferredDeliveryTime = preferredDeliveryTime;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
        success: true,
        data: userResponse,
    });
});

// NEW: Get single user by ID
export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    if (user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to view this profile',
        });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
        success: true,
        data: userResponse,
    });
});