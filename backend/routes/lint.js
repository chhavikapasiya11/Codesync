const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// POST /api/lint
router.post('/', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const tempFile = path.join(__dirname, 'tempCode.js');
  fs.writeFileSync(tempFile, code);

  exec(`npx eslint "${tempFile}" -f json`, (err, stdout, stderr) => {
    if (err && !stdout) {
      return res.status(500).json({ error: 'ESLint execution failed' });
    }

    let lintResults = [];
    try {
      lintResults = JSON.parse(stdout || '[]');
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse ESLint output' });
    }

    const messages = lintResults[0]?.messages || [];
    const formatted = messages.map(msg => ({
      line: msg.line,
      column: msg.column,
      message: msg.message,
      ruleId: msg.ruleId,
      severity: msg.severity === 2 ? 'error' : 'warning'
    }));

    res.json({ errors: formatted });
  });
});

module.exports = router;
