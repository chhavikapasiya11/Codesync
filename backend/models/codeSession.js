const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: String,
  content: String,
  language: String
});

const CodeSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true }, // Link to your existing session
  files: [FileSchema],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CodeSession', CodeSessionSchema);
