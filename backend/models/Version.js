const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
  savedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = mongoose.model('Version', versionSchema);
