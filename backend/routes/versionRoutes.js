const express = require('express');
const router = express.Router();
const Version = require('../models/Version');
const authenticate = require('../middleware/authenticate');

// POST /api/versions/save
router.post('/save', authenticate, async (req, res) => {
  const { sessionId, code } = req.body;

  try {
    const version = new Version({
      sessionId,
      code,
      savedBy: req.user.id,
    });
    await version.save();
    res.status(201).json({ msg: 'Version saved', version });
  } catch (err) {
    res.status(500).json({ error: 'Error saving version' });
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

module.exports = router;
