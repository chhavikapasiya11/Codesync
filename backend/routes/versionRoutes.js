const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Version = require('../models/Version');
const authenticate = require('../middleware/authenticate');

// Setup multer for handling multipart form data (audio files)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/audio');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `audio-${uniqueSuffix}.webm`);
  },
});

const upload = multer({ storage });

// POST /api/versions/save
router.post('/save', authenticate, upload.single('audio'), async (req, res) => {
  const { sessionId, code, message } = req.body;

  if (!sessionId || !code) {
    return res.status(400).json({ error: 'Missing sessionId or code' });
  }

  try {
    const version = new Version({
      sessionId,
      code,
      message,
      savedBy: req.user._id,
      audioPath: req.file ? `/uploads/audio/${req.file.filename}` : null,
    });

    await version.save();
    res.status(201).json({ msg: 'Version saved', version });
  } catch (err) {
    console.error('Save version error:', err);
    res.status(500).json({ error: 'Error saving version', details: err.message });
  }
});

// GET /api/versions/:sessionId
router.get('/:sessionId', authenticate, async (req, res) => {
  try {
    const versions = await Version.find({ sessionId: req.params.sessionId })
      .sort({ savedAt: -1 });
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching versions' });
  }
});
// POST /api/versions/restore
router.post('/restore', authenticate, async (req, res) => {
  const { versionId } = req.body;

  try {
    const version = await Version.findById(versionId);
    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json({ msg: 'Version restored', code: version.code });
  } catch (err) {
    res.status(500).json({ error: 'Error restoring version' });
  }
});

// POST /api/versions/diff
const jsdiff = require('diff'); // already imported

// smart commit generator
function generateCommitMessage(diff) {
  if (diff.some(line => line.value.includes('console.log') && line.added)) {
    return "Added a new log statement";
  }
  if (diff.some(line => line.removed)) {
    return "Removed some code lines";
  }
  if (diff.some(line => line.value.includes('function') && line.added)) {
  return "Added a new function";
}
if (diff.some(line => line.value.includes('if') && line.added)) {
  return "Modified conditional logic";
}
  return "Updated code";
}

router.post('/diff', authenticate, async (req, res) => {
  const { versionId1, versionId2 } = req.body;

  try {
    const [v1, v2] = await Promise.all([
      Version.findById(versionId1),
      Version.findById(versionId2),
    ]);

    if (!v1 || !v2) {
      return res.status(404).json({ error: 'One or both versions not found' });
    }

    const diff = jsdiff.diffLines(v1.code, v2.code);
    const suggestedMessage = generateCommitMessage(diff); // 🧠 auto message

    res.json({
      diff,
      suggestedMessage // send back the AI-like result
    });
  } catch (err) {
    res.status(500).json({ error: 'Error comparing versions' });
  }
});



module.exports = router;
