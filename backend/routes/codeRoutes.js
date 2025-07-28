const express = require('express');
const router = express.Router();
const CodeSession = require('../models/codeSession');

// Fetch all files for a session
router.get('/:id/files', async (req, res) => {
  try {
    const session = await CodeSession.findOne({ sessionId: req.params.id });
    if (!session) return res.json({ files: [] });
    res.json({ files: session.files });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save or update files for a session
router.post('/:id/files', async (req, res) => {
  try {
    const { files } = req.body;
    let session = await CodeSession.findOne({ sessionId: req.params.id });

    if (session) {
      session.files = files;
      session.updatedAt = new Date();
      await session.save();
    } else {
      session = await CodeSession.create({ sessionId: req.params.id, files });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
