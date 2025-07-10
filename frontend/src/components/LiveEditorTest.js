import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const sessionId = 'abc123'; // test session ID

const LiveEditorTest = () => {
  const [code, setCode] = useState('');
  const socketRef = useRef(null); 

  useEffect(() => {
    // Create socket connection once
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    // Join session
    socketRef.current.emit('join-session', { sessionId });

    // Listen for code updates
    socketRef.current.on('code-update', ({ code }) => {
      setCode(code);
    });

    // Cleanup
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Emit code changes
  const handleChange = (e) => {
    const updated = e.target.value;
    setCode(updated);
    socketRef.current.emit('code-change', { sessionId, code: updated });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Live Code Collaboration Test</h3>
      <textarea
        value={code}
        onChange={handleChange}
        rows={10}
        cols={80}
        placeholder="Start typing to test live updates"
      />
    </div>
  );
};

export default LiveEditorTest;
