const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const {
  validateRegisterInput,
  validateLoginInput,
} = require('../validators/inputValidators');

// Generate JWT token helper
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'trizen_jwt_super_secret_key_2026';
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    secret,
    { expiresIn: '7d' }
  );
};

// @desc    Register a new service provider
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validate inputs
    const { errors, isValid } = validateRegisterInput({
      name,
      email,
      phone,
      password,
      confirmPassword,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: Object.values(errors)[0],
        errors,
      });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Create user with default role 'provider'
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      role: 'provider',
    });

    // Create default Draft ProviderProfile linked to user
    const profile = await ProviderProfile.create({
      userId: user._id,
      applicationStatus: 'Draft',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to Trizen!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        profile: {
          id: profile._id,
          _id: profile._id,
          applicationStatus: profile.applicationStatus,
          completionPercentage: 0,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (Provider or Admin)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate login input
    const { errors, isValid } = validateLoginInput({ email, password });
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: Object.values(errors)[0],
        errors,
      });
    }

    // Find user with password included
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    let profileData = null;
    if (user.role === 'provider') {
      let profile = await ProviderProfile.findOne({ userId: user._id });
      if (!profile) {
        // Create if missing
        profile = await ProviderProfile.create({
          userId: user._id,
          applicationStatus: 'Draft',
        });
      }
      profileData = {
        id: profile._id,
        _id: profile._id,
        applicationStatus: profile.applicationStatus,
        rejectionRemarks: profile.rejectionRemarks,
        completionPercentage: profile.calculateCompletion(),
      };
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        profile: profileData,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user info
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    let profile = null;
    if (user.role === 'provider') {
      profile = await ProviderProfile.findOne({ userId: user._id });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
