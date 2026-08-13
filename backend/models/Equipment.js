const mongoose = require('mongoose');

// 1. Define the Equipment Blueprint
const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  tag: {
    type: String, // E.g., 'P-102'
    required: true,
    unique: true,
  },
  type: {
    type: String, // E.g., 'Centrifugal Pump'
    required: true,
  },
  area: {
    type: String, // E.g., 'North Plant'
    required: true,
  },
  criticality: {
    type: String,
    enum: ['Safety-Critical', 'High', 'Medium', 'Low'],
    required: true,
  },
  healthScore: {
    type: Number, // 0-100
    default: 100,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ['Healthy', 'Watch', 'Warning', 'Critical'],
    default: 'Healthy',
  },
  manufacturer: {
    type: String,
    default: '',
  },
  installedDate: {
    type: Date,
    default: null,
  },
  lastMaintenance: {
    type: Date,
    default: null,
  },
  // Latest sensor readings (optional snapshot)
  sensors: {
    vibration: { type: Number, default: null },   // mm/s
    temperature: { type: Number, default: null },  // °C
    pressure: { type: Number, default: null },     // kPa
    flowRate: { type: Number, default: null },     // L/min
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Pre-save hook: auto-compute status from healthScore
equipmentSchema.pre('save', function (next) {
  if (this.healthScore >= 85) this.status = 'Healthy';
  else if (this.healthScore >= 70) this.status = 'Watch';
  else if (this.healthScore >= 50) this.status = 'Warning';
  else this.status = 'Critical';
  next();
});

// 2. Export the Model
module.exports = mongoose.model('Equipment', equipmentSchema);
