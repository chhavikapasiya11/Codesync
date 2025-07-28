const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  files: [
    {
      name: { type: String, required: true },
      content: { type: String, required: true },
    },
  ],
  savedAt: {
    type: Date,
    default: Date.now,
  },
  savedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  message: {
    type: String,
    default: '',
  },
  audioPath: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model('Version', versionSchema);
