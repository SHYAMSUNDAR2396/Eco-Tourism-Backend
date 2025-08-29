const express = require('express');
const { authenticateToken, requireUser } = require('../middleware/auth');
const EcoEvent = require('../models/EcoEvent');
const EventRegistration = require('../models/EventRegistration');

const router = express.Router();

// Public route - Get all active eco-events (Home Page/Dashboard)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search = '', 
      category = '', 
      status = 'upcoming',
      sortBy = 'date',
      sortOrder = 'asc'
    } = req.query;

    const query = { isActive: true };
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const events = await EcoEvent.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title date location progress category images maxParticipants currentParticipants price duration difficulty status');
    
    const total = await EcoEvent.countDocuments(query);

    // Get categories for filter dropdown
    const categories = await EcoEvent.distinct('category');

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          eventsPerPage: parseInt(limit)
        },
        filters: {
          categories,
          search,
          category,
          status
        }
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Public route - Get event details by ID
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await EcoEvent.findById(eventId)
      .populate('createdBy', 'name email')
      .select('-__v');
    
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is authenticated and registered for this event
    let userRegistration = null;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        
        userRegistration = await EventRegistration.findOne({
          user: userId,
          event: eventId
        }).select('status paymentStatus registrationDate');
      } catch (error) {
        // Token invalid or expired, user is not authenticated
      }
    }

    res.json({
      success: true,
      data: {
        event,
        userRegistration
      }
    });
  } catch (error) {
    console.error('Get event details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Protected route - Register for an event
router.post('/:eventId/register', authenticateToken, requireUser, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const { 
      specialRequirements, 
      emergencyContact, 
      paymentMethod = 'other' 
    } = req.body;

    // Check if event exists and is active
    const event = await EcoEvent.findById(eventId);
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or inactive'
      });
    }

    // Check if event is full
    if (event.isFull) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Check if event is in the past
    if (event.date < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for past events'
      });
    }

    // Check if user is already registered
    const existingRegistration = await EventRegistration.findOne({
      user: userId,
      event: eventId
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Create registration
    const registration = new EventRegistration({
      user: userId,
      event: eventId,
      paymentAmount: event.price,
      paymentMethod,
      specialRequirements,
      emergencyContact
    });

    await registration.save();

    // Increment event participants
    await event.addParticipant();

    res.status(201).json({
      success: true,
      message: 'Successfully registered for event',
      data: {
        registration: registration.toJSON(),
        event: {
          id: event._id,
          title: event.title,
          currentParticipants: event.currentParticipants,
          maxParticipants: event.maxParticipants
        }
      }
    });
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Protected route - Cancel event registration
router.delete('/:eventId/register', authenticateToken, requireUser, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    // Find registration
    const registration = await EventRegistration.findOne({
      user: userId,
      event: eventId
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check if cancellation is allowed
    if (registration.status === 'cancelled' || registration.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this registration'
      });
    }

    // Cancel registration
    await registration.cancel(reason);

    // Decrement event participants
    const event = await EcoEvent.findById(eventId);
    if (event) {
      await event.removeParticipant();
    }

    res.json({
      success: true,
      message: 'Registration cancelled successfully',
      data: {
        registration: registration.toJSON()
      }
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Protected route - Get user's event registrations (for Profile Page)
router.get('/user/registrations', authenticateToken, requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const { status = '', page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const registrations = await EventRegistration.find(query)
      .populate('event', 'title date location progress status images category')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await EventRegistration.countDocuments(query);

    res.json({
      success: true,
      data: {
        registrations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRegistrations: total,
          registrationsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
