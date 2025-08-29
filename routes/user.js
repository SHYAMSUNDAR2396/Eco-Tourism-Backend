const express = require('express');
const { authenticateToken, requireUser } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Apply user authentication to all routes
router.use(authenticateToken, requireUser);

// User Dashboard - Get user's own information and basic stats
router.get('/dashboard', async (req, res) => {
  try {
    // Get user's own profile
    const user = await User.findById(req.user._id).select('-password');
    
    // Get eco-event statistics
    const EventRegistration = require('../models/EventRegistration');
    const totalRegistrations = await EventRegistration.countDocuments({ user: req.user._id });
    const activeRegistrations = await EventRegistration.countDocuments({ 
      user: req.user._id, 
      status: { $in: ['pending', 'confirmed'] } 
    });
    const completedEvents = await EventRegistration.countDocuments({ 
      user: req.user._id, 
      status: 'completed' 
    });

    const stats = {
      totalRegistrations,
      activeRegistrations,
      completedEvents,
      memberSince: user.createdAt
    };

    res.json({
      success: true,
      data: {
        user,
        stats
      }
    });
  } catch (error) {
    console.error('User dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get user's own profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update user's own profile
router.put('/profile', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Change user's own password
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id);
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Deactivate user's own account
router.patch('/deactivate', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
