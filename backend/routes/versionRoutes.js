const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Version = require('../models/Version');
const authenticate = require('../middleware/authenticate');
const jsdiff = require('diff');

//  audio upload
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

/**
 *  POST /api/versions/save
 * Save a new version with multiple files
 */
router.post('/save', authenticate, upload.single('audio'), async (req, res) => {
  try {
   console.log("REQ HEADERS:", req.headers);
console.log("REQ BODY:", req.body);


    const { sessionId, message } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    if (!req.body.files) {
      return res.status(400).json({ error: 'Missing files' });
    }

    let parsedFiles;
    try {
      parsedFiles = JSON.parse(req.body.files);
    } catch (parseErr) {
      return res.status(400).json({ error: 'Invalid JSON format for files' });
    }

    if (!Array.isArray(parsedFiles) || parsedFiles.length === 0) {
      return res.status(400).json({ error: 'Files must be a non-empty array' });
    }

    const isValidFiles = parsedFiles.every(f => f.name && typeof f.content === "string");
    if (!isValidFiles) {
      return res.status(400).json({ error: "Invalid file format: each file needs name and content" });
    }

    const version = new Version({
      sessionId,
      files: parsedFiles,
      message: message || "(no message)",
      savedBy: req.user._id,
      audioPath: req.file ? `/uploads/audio/${req.file.filename}` : null
    });

    await version.save();

    res.status(201).json({ msg: 'Version saved successfully', version });
  } catch (err) {
    console.error('Error saving version:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

/**
 *  GET /api/versions/:sessionId
 * Get all versions for a session
 */
router.get('/:sessionId', authenticate, async (req, res) => {
  try {
    const versions = await Version.find({ sessionId: req.params.sessionId })
      .sort({ savedAt: -1 });
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching versions' });
  }
});

/**
 *  POST /api/versions/restore
 * Restore files from a version
 */
router.post('/restore', authenticate, async (req, res) => {
  const { versionId } = req.body;

  try {
    const version = await Version.findById(versionId);
    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json({ msg: 'Version restored', files: version.files });
  } catch (err) {
    res.status(500).json({ error: 'Error restoring version' });
  }
});

/**
 *  POST /api/versions/diff
 * Compare two versions
 */
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

  //  Validate inputs
  if (!versionId1 || !versionId2) {
    return res.status(400).json({ error: 'Both version IDs are required' });
  }

  try {
    const [v1, v2] = await Promise.all([
      Version.findById(versionId1),
      Version.findById(versionId2),
    ]);

    if (!v1 || !v2) {
      return res.status(404).json({ error: 'One or both versions not found' });
    }

    //  Compare files by file name (not by index)
    const diffs = [];
    const fileMapV2 = new Map(v2.files.map(f => [f.name, f]));

    for (const file1 of v1.files) {
      const file2 = fileMapV2.get(file1.name) || { content: '' };
      const diff = jsdiff.diffLines(file1.content || '', file2.content || '');
      diffs.push({ fileName: file1.name, diff });
    }

    //  Check if v2 has extra files not in v1
    for (const file2 of v2.files) {
      if (!v1.files.find(f => f.name === file2.name)) {
        const diff = jsdiff.diffLines('', file2.content || '');
        diffs.push({ fileName: file2.name, diff });
      }
    }

    const allDiffLines = diffs.flatMap(d => d.diff);

    res.json({
      diffs,
      suggestedMessage: generateCommitMessage(allDiffLines),
    });
  } catch (err) {
    console.error('Diff error:', err);
    res.status(500).json({ error: 'Error comparing versions' });
  }
});

module.exports = router;
