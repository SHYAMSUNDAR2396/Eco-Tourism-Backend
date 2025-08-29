const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const EcoEvent = require('../models/EcoEvent');
const EventRegistration = require('../models/EventRegistration');

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateToken, requireAdmin);

// Admin Dashboard - Get events created by admin
router.get('/dashboard', async (req, res) => {
  try {
    const adminId = req.user._id;
    
    // Get events created by this admin
    const events = await EcoEvent.find({ createdBy: adminId })
      .sort({ createdAt: -1 })
      .select('title status progress currentParticipants maxParticipants date location category');
    
    // Get statistics
    const totalEvents = await EcoEvent.countDocuments({ createdBy: adminId });
    const activeEvents = await EcoEvent.countDocuments({ createdBy: adminId, isActive: true });
    const upcomingEvents = await EcoEvent.countDocuments({ 
      createdBy: adminId, 
      status: 'upcoming',
      date: { $gt: new Date() }
    });
    const totalRegistrations = await EventRegistration.countDocuments({
      event: { $in: await EcoEvent.find({ createdBy: adminId }).select('_id') }
    });

    res.json({
      success: true,
      data: {
        events,
        stats: {
          totalEvents,
          activeEvents,
          upcomingEvents,
          totalRegistrations
        }
      }
    });
  } catch (error) {
    console.error('Admin events dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get all events created by admin with pagination and filters
router.get('/', async (req, res) => {
  try {
    const adminId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category = '', 
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { createdBy: adminId };
    
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
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const events = await EcoEvent.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await EcoEvent.countDocuments(query);

    // Get categories for filter dropdown
    const categories = await EcoEvent.distinct('category', { createdBy: adminId });

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
    console.error('Get admin events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Create new event
router.post('/', async (req, res) => {
  try {
    const adminId = req.user._id;
    const {
      title,
      description,
      category,
      date,
      location,
      coordinates,
      images,
      maxParticipants,
      price,
      duration,
      difficulty,
      requirements,
      highlights,
      organizer
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !date || !location || !maxParticipants || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate date is in the future
    if (new Date(date) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Event date must be in the future'
      });
    }

    const event = new EcoEvent({
      title,
      description,
      category,
      date,
      location,
      coordinates,
      images: images || [],
      maxParticipants,
      price,
      duration,
      difficulty: difficulty || 'Moderate',
      requirements: requirements || [],
      highlights: highlights || [],
      organizer: organizer || {},
      createdBy: adminId
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get event by ID (admin view)
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const adminId = req.user._id;
    
    const event = await EcoEvent.findOne({ _id: eventId, createdBy: adminId });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: {
        event
      }
    });
  } catch (error) {
    console.error('Get admin event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update event
router.put('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const adminId = req.user._id;
    const updateData = req.body;

    // Find event and verify ownership
    const event = await EcoEvent.findOne({ _id: eventId, createdBy: adminId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Prevent updating certain fields if event has registrations
    const hasRegistrations = await EventRegistration.exists({ event: eventId });
    if (hasRegistrations) {
      delete updateData.maxParticipants;
      delete updateData.price;
    }

    // Update event
    const updatedEvent = await EcoEvent.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event: updatedEvent
      }
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update event progress
router.patch('/:eventId/progress', async (req, res) => {
  try {
    const { eventId } = req.params;
    const adminId = req.user._id;
    const { progress } = req.body;

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be a number between 0 and 100'
      });
    }

    // Find event and verify ownership
    const event = await EcoEvent.findOne({ _id: eventId, createdBy: adminId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Update progress
    await event.updateProgress(progress);

    res.json({
      success: true,
      message: 'Event progress updated successfully',
      data: {
        event: {
          id: event._id,
          title: event.title,
          progress: event.progress
        }
      }
    });
  } catch (error) {
    console.error('Update event progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update event status
router.patch('/:eventId/status', async (req, res) => {
  try {
    const { eventId } = req.params;
    const adminId = req.user._id;
    const { status } = req.body;

    if (!['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Find event and verify ownership
    const event = await EcoEvent.findOne({ _id: eventId, createdBy: adminId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Update status
    event.status = status;
    await event.save();

    res.json({
      success: true,
      message: 'Event status updated successfully',
      data: {
        event: {
          id: event._id,
          title: event.title,
          status: event.status
        }
      }
    });
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Delete event
router.delete('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const adminId = req.user._id;

    // Find event and verify ownership
    const event = await EcoEvent.findOne({ _id: eventId, createdBy: adminId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event has registrations
    const hasRegistrations = await EventRegistration.exists({ event: eventId });
    if (hasRegistrations) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with existing registrations'
      });
    }

    await EcoEvent.findByIdAndDelete(eventId);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get event registrations
router.get('/:eventId/registrations', async (req, res) => {
  try {
    const { eventId } = req.params;
    const adminId = req.user._id;
    const { page = 1, limit = 20, status = '' } = req.query;

    // Verify event ownership
    const event = await EcoEvent.findOne({ _id: eventId, createdBy: adminId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const query = { event: eventId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const registrations = await EventRegistration.find(query)
      .populate('user', 'name email phone')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await EventRegistration.countDocuments(query);

    res.json({
      success: true,
      data: {
        event: {
          id: event._id,
          title: event.title,
          currentParticipants: event.currentParticipants,
          maxParticipants: event.maxParticipants
        },
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
    console.error('Get event registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update registration status
router.patch('/:eventId/registrations/:registrationId', async (req, res) => {
  try {
    const { eventId, registrationId } = req.params;
    const adminId = req.user._id;
    const { status, notes } = req.body;

    // Verify event ownership
    const event = await EcoEvent.findOne({ _id: eventId, createdBy: adminId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find and update registration
    const registration = await EventRegistration.findById(registrationId);
    if (!registration || registration.event.toString() !== eventId) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (notes) {
      registration.notes = notes;
    }

    if (status) {
      registration.status = status;
    }

    await registration.save();

    res.json({
      success: true,
      message: 'Registration updated successfully',
      data: {
        registration
      }
    });
  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
