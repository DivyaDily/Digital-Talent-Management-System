const mongoose = require('mongoose');

// Sprint milestones (e.g. "Sprint 1: Foundation") — title + description + dueDate + status
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueDate: { type: Date, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);

