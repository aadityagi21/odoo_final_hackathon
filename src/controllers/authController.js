const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT Token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'urban_furniture_super_secret_jwt_key_2026_accounting_system', {
    expiresIn: '7d'
  });
};

// Password Regex: > 8 chars, 1 uppercase, 1 lowercase, 1 special char
const validatePasswordPattern = (password) => {
  if (!password || password.length <= 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
  return hasUpper && hasLower && hasSpecial;
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, loginId, email, role, password, rePassword } = req.body;

    // Basic Presence check
    if (!name || !loginId || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // 1. Login ID Validation (6-12 chars)
    const trimmedLoginId = loginId.trim();
    if (trimmedLoginId.length < 6 || trimmedLoginId.length > 12) {
      return res.status(400).json({
        success: false,
        message: 'Login Id must be between 6 and 12 characters'
      });
    }

    // Check duplicate Login ID
    const existingLoginId = await User.findOne({ loginId: trimmedLoginId });
    if (existingLoginId) {
      return res.status(400).json({
        success: false,
        message: 'Login Id already exists. Please choose a different Login Id.'
      });
    }

    // 2. Email duplicate check
    const trimmedEmail = email.trim().toLowerCase();
    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email Id is already registered in the system.'
      });
    }

    // 3. Password Strength Validation
    if (!validatePasswordPattern(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be more than 8 characters and contain at least one uppercase letter, one lowercase letter, and one special character.'
      });
    }

    // 4. Password Re-entry Matching
    if (rePassword !== undefined && password !== rePassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Re-Enter Password do not match'
      });
    }

    // Valid role check
    const validRoles = ['User', 'Accountant', 'Administrator'];
    const assignedRole = validRoles.includes(role) ? role : 'Accountant';

    // Create user
    const user = await User.create({
      name: name.trim(),
      loginId: trimmedLoginId,
      email: trimmedEmail,
      password,
      role: assignedRole
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        loginId: user.loginId,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server Error during registration'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Login Id or Password'
      });
    }

    const trimmedLoginId = loginId.trim();

    // Match creds by Login ID or Email
    const user = await User.findOne({
      $or: [{ loginId: trimmedLoginId }, { email: trimmedLoginId.toLowerCase() }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Login Id or Password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Login Id or Password'
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        loginId: user.loginId,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Request Password Reset Token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { loginId } = req.body;
    if (!loginId) {
      return res.status(400).json({ success: false, message: 'Please provide Login Id or Email' });
    }

    const query = loginId.trim();
    const user = await User.findOne({
      $or: [{ loginId: query }, { email: query.toLowerCase() }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User with provided Login Id or Email not found' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: 'Password reset request generated successfully.',
      resetToken,
      loginId: user.loginId
    });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    return res.status(500).json({ success: false, message: 'Server error during forgot password' });
  }
};

// @desc    Reset Password with Token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, reNewPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required' });
    }

    if (!validatePasswordPattern(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be more than 8 characters and contain at least one uppercase letter, one lowercase letter, and one special character.'
      });
    }

    if (reNewPassword !== undefined && newPassword !== reNewPassword) {
      return res.status(400).json({ success: false, message: 'New Password and Re-Enter Password do not match' });
    }

    const user = await User.findOne({
      resetToken,
      resetTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpire = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });

  } catch (err) {
    console.error('Reset Password Error:', err);
    return res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe
};
