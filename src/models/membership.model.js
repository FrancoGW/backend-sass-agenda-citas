const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // duración en días
    required: true
  },
  features: [{
    type: String
  }],
  maxAppointments: {
    type: Number,
    required: true
  },
  maxClients: {
    type: Number,
    required: true
  },
  customDomain: {
    type: Boolean,
    default: false
  },
  analytics: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership; 