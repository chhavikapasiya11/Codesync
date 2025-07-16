// routes/run.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

router.post('/', async (req, res) => {
  const { code, languageId } = req.body; 

  if (!code || !languageId) {
    return res.status(400).json({ error: 'Missing code or languageId' });
  }

  try {
    // Step 1: Submit code
    const submission = await axios.post(
      'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
      {
        source_code: code,
        language_id: languageId
      },
      {
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      }
    );

    const { stdout, stderr, compile_output, message } = submission.data;

    res.json({
      output: stdout || '',
      error: stderr || compile_output || message || ''
    });

  } catch (error) {
    console.error('Execution error:', error.message);
    res.status(500).json({ error: 'Execution failed', details: error.message });
  }
});

module.exports = router;
