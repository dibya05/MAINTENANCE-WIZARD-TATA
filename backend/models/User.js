const mongoose = require('mongoose');

// 1. Define the Blueprint (Schema)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // This means a user MUST provide a name
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have the same email
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'Maintenance Technician', // If they don't provide a role, use this default
  },
  facility: {
    type: String,
    required: true,
  }
}, { 
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' dates!
});

// 2. Create the Model and Export it
module.exports = mongoose.model('User', userSchema);
