import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api"; 

const SessionPage = () => {
  const [sessionName, setSessionName] = useState("");
  const [joinSessionId, setJoinSessionId] = useState("");
  const [userSessions, setUserSessions] = useState([]);
  const [message, setMessage] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/sessions/create", { sessionName });
      const newSessionId = res.data.session.sessionId;
      setSessionName("");
      localStorage.setItem("sessionId", newSessionId);
      navigate(`/editor/${newSessionId}`);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to create session.");
    }
  };

  const handleJoinSession = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/sessions/join", { sessionId: joinSessionId });
      const joinedSessionId = res.data.session.sessionId;
      setJoinSessionId("");
      localStorage.setItem("sessionId", joinedSessionId);
      navigate(`/editor/${joinedSessionId}`);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to join session.");
    }
  };

  const fetchSessions = async () => {
    if (!user || !user.id) return;
    try {
      const res = await API.get(`/sessions/user/${user.id}`);
      setUserSessions(res.data);
    } catch (err) {
      setMessage("Failed to load sessions.");
    }
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchSessions();
    }
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#0d0d0d",
        color: "white",
        minHeight: "100vh",
        padding: "40px 20px",
        marginTop: "40px",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <h2
        style={{
          color: "#00f0ff",
          textAlign: "center",
          marginBottom: "30px",
          fontWeight: "600",
          fontSize: "32px",
        }}
      >
        Session Dashboard
      </h2>

      {message && (
        <div
          style={{
            backgroundColor: "#1e1e1e",
            color: "#ff7675",
            padding: "12px 20px",
            borderRadius: "8px",
            textAlign: "center",
            marginBottom: "20px",
            fontWeight: "500",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "30px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "50px",
        }}
      >
        {/* Create Session */}
        <div
          style={{
            backgroundColor: "#1e1e1e",
            padding: "30px",
            borderRadius: "16px",
            boxShadow: "0 0 15px rgba(0,255,255,0.2)",
            width: "100%",
            maxWidth: "500px",
          }}
        >
          <h4 style={{ color: "#38f9d7", marginBottom: "20px" }}>Create Session</h4>
          <form onSubmit={handleCreateSession}>
            <input
              type="text"
              placeholder="Enter Session Name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "#333",
                color: "white",
                border: "none",
                marginBottom: "15px",
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#00f0ff",
                color: "#000",
                fontWeight: "bold",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Create
            </button>
          </form>
        </div>

        {/* Join Session */}
        <div
          style={{
            backgroundColor: "#1e1e1e",
            padding: "30px",
            borderRadius: "16px",
            boxShadow: "0 0 15px rgba(255,180,255,0.2)",
            width: "100%",
            maxWidth: "500px",
          }}
        >
          <h4 style={{ color: "#f5b4ff", marginBottom: "20px" }}>Join Session</h4>
          <form onSubmit={handleJoinSession}>
            <input
              type="text"
              placeholder="Enter Session ID"
              value={joinSessionId}
              onChange={(e) => setJoinSessionId(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "#333",
                color: "white",
                border: "none",
                marginBottom: "15px",
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#f5b4ff",
                color: "#000",
                fontWeight: "bold",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Sessions List */}
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h4 style={{ color: "#29ff94", marginBottom: "20px" }}>Your Sessions</h4>
        {userSessions.length === 0 ? (
          <p style={{ color: "#aaa" }}>No sessions found.</p>
        ) : (
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {userSessions.map((session) => (
              <li
                key={session._id}
                style={{
                  backgroundColor: "#2c2c2c",
                  marginBottom: "15px",
                  padding: "15px 20px",
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#fff",
                  boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                }}
              >
                <div>
                  <strong style={{ fontSize: "18px" }}>
                    {session.sessionName || "Untitled"}
                  </strong>
                  <br />
                  <small style={{ color: "#ccc" }}>
                    Created By: {session.createdBy?.name || "N/A"}
                  </small>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      backgroundColor: "#00f0ff",
                      color: "#000",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    {session.sessionId}
                  </span>
                  <button
                    onClick={() => handleCopy(session.sessionId)}
                    style={{
                      backgroundColor: "#1e1e1e",
                      color: "#00f0ff",
                      border: "1px solid #00f0ff",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {copiedId === session.sessionId ? "Copied!" : "Copy"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SessionPage;
