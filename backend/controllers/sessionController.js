const Session = require('../models/Session');
const { v4: uuidv4 } = require('uuid');

// POST /api/sessions/create
exports.createSession = async (req, res) => {
  try {
    const { sessionName } = req.body;
    const sessionId = uuidv4(); // unique session ID
    const newSession = new Session({
      sessionId,
      sessionName,
      createdBy: req.user.id,
      participants: [req.user.id],
    });

    await newSession.save();
    res.status(201).json({ message: 'Session created', session: newSession });
  } catch (error) {
    res.status(500).json({ error: 'Error creating session' });
  }
};

// POST /api/sessions/join
exports.joinSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (!session.participants.includes(req.user.id)) {
      session.participants.push(req.user.id);
      await session.save();
    }

    res.json({ message: 'Joined session', session });
  } catch (error) {
    res.status(500).json({ error: 'Error joining session' });
  }
};

// GET /api/sessions/user/:id
exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.params.id;
    const sessions = await Session.find({
      participants: userId
    }).populate('createdBy', 'name').sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sessions' });
  }
};
