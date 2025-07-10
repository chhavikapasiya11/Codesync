const express = require('express');
const router = express.Router();
const { createSession, joinSession, getUserSessions } = require('../controllers/sessionController');
const authenticate = require('../middleware/authenticate'); 

router.post('/create', authenticate, createSession);
router.post('/join', authenticate, joinSession);
router.get('/user/:id', authenticate, getUserSessions);

module.exports = router;
