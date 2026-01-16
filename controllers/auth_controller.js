import asyncHandler from '../middleware/async.js';
import User from '../models/user_model.js';

// @desc    Register user
// @route   POST /api/v1/users
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, username, phoneNumber } = req.body;

    // Required fields
    if (!fullName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Full name, email and password are required',
        });
    }

    // Check for existing email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
        return res.status(400).json({
            success: false,
            message: 'Email already exists',
        });
    }

    // Optional username check
    if (username) {
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({
                success: false,
                message: 'Username already taken',
            });
        }
    }

    // Create user
    const user = await User.create({
        fullName,
        email,
        password, // will be hashed automatically
        username: username || undefined,
        phoneNumber: phoneNumber || undefined,
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
        success: true,
        data: userResponse,
        // NO token here – login will provide it
    });
});

// @desc    Login user
// @route   POST /api/v1/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password',
        });
    }

    // Check for user + include password
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
        });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    // Remove password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
        success: true,
        token,
        data: userResponse,
    });
});