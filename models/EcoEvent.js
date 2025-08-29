const mongoose = require('mongoose');

const ecoEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['Wildlife Safari', 'Nature Trek', 'Bird Watching', 'Conservation', 'Cultural Tour', 'Adventure', 'Photography', 'Other'],
    default: 'Other'
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  images: [{
    url: String,
    alt: String
  }],
  maxParticipants: {
    type: Number,
    required: [true, 'Maximum participants is required'],
    min: 1
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'Event price is required'],
    min: 0
  },
  duration: {
    type: Number, // in hours
    required: [true, 'Event duration is required'],
    min: 0.5
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Challenging', 'Expert'],
    default: 'Moderate'
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  requirements: [String],
  highlights: [String],
  organizer: {
    name: String,
    contact: String,
    email: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
ecoEventSchema.index({ category: 1, date: 1, status: 1 });
ecoEventSchema.index({ location: 'text', title: 'text', description: 'text' });
ecoEventSchema.index({ createdBy: 1 });

// Virtual for checking if event is full
ecoEventSchema.virtual('isFull').get(function() {
  return this.currentParticipants >= this.maxParticipants;
});

// Virtual for checking if event is upcoming
ecoEventSchema.virtual('isUpcoming').get(function() {
  return this.date > new Date() && this.status === 'upcoming';
});

// Method to update progress
ecoEventSchema.methods.updateProgress = function(progress) {
  this.progress = Math.max(0, Math.min(100, progress));
  return this.save();
};

// Method to add participant
ecoEventSchema.methods.addParticipant = function() {
  if (this.currentParticipants < this.maxParticipants) {
    this.currentParticipants += 1;
    return this.save();
  }
  throw new Error('Event is full');
};

// Method to remove participant
ecoEventSchema.methods.removeParticipant = function() {
  if (this.currentParticipants > 0) {
    this.currentParticipants -= 1;
    return this.save();
  }
  throw new Error('No participants to remove');
};

module.exports = mongoose.model('EcoEvent', ecoEventSchema); 
