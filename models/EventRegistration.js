const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EcoEvent',
    required: [true, 'Event ID is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    required: [true, 'Payment amount is required']
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'other'],
    default: 'other'
  },
  specialRequirements: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  cancellationReason: String,
  cancellationDate: Date,
  refundAmount: Number,
  notes: String
}, {
  timestamps: true
});

// Compound index to ensure unique user-event combinations
eventRegistrationSchema.index({ user: 1, event: 1 }, { unique: true });

// Index for efficient queries
eventRegistrationSchema.index({ user: 1, status: 1 });
eventRegistrationSchema.index({ event: 1, status: 1 });
eventRegistrationSchema.index({ status: 1, registrationDate: 1 });

// Virtual for checking if registration is active
eventRegistrationSchema.virtual('isActive').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

// Method to confirm registration
eventRegistrationSchema.methods.confirm = function() {
  this.status = 'confirmed';
  return this.save();
};

// Method to cancel registration
eventRegistrationSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancellationDate = new Date();
  return this.save();
};

// Method to complete registration
eventRegistrationSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

// Method to update payment status
eventRegistrationSchema.methods.updatePaymentStatus = function(status) {
  this.paymentStatus = status;
  return this.save();
};

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema); 
