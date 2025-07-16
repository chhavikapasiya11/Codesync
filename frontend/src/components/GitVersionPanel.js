import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function GitVersionPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId, token, code } = location.state || {};

  const [versions, setVersions] = useState([]);
  const [diffResult, setDiffResult] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const [restoredCode, setRestoredCode] = useState(null);

  const restoredRef = useRef(null); // ✅ Ref for scroll

  // ✅ Fetch versions
  const fetchVersions = async () => {
    if (!sessionId || !token) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/versions/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVersions(res.data);
    } catch (err) {
      console.error("Error fetching versions:", err);
      alert("Failed to fetch version history.");
    }
    setLoading(false);
  };

  const saveVersion = async () => {
    if (!code?.trim()) {
      alert("Cannot save empty code!");
      return;
    }
    const formData = new FormData();
    formData.append("sessionId", sessionId);
    formData.append("code", code);
    formData.append("message", message || "(no message)");

    if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      formData.append("audio", blob);
    }

    try {
      await axios.post("http://localhost:5000/api/versions/save", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Version saved successfully!");
      fetchVersions();
      setMessage("");
      audioChunksRef.current = [];
    } catch (err) {
      console.error("Error saving version:", err);
      alert("Failed to save version.");
    }
  };

  const restoreVersion = async (versionId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/versions/restore",
        { versionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRestoredCode(res.data.code);

      setTimeout(() => {
        if (restoredRef.current) {
          restoredRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    } catch (err) {
      console.error("Error restoring version:", err);
      alert("Failed to restore version.");
    }
  };

  const compareVersions = async () => {
    if (selectedIds.length !== 2) return;
    try {
      const res = await axios.post(
        "http://localhost:5000/api/versions/diff",
        { versionId1: selectedIds[0], versionId2: selectedIds[1] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiffResult(res.data.diff);
    } catch (err) {
      console.error("Error comparing versions:", err);
      alert("Failed to generate diff.");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  useEffect(() => {
    if (sessionId && token) {
      fetchVersions();
    }
  }, [sessionId, token]);

  useEffect(() => {
    if (selectedIds.length === 2) compareVersions();
    else setDiffResult(null);
  }, [selectedIds]);

  if (!sessionId || !token) {
    return (
      <div style={{ padding: "20px", color: "#fff", textAlign: "center" }}>
        ⚠ Missing session data.
        <button
          onClick={() => navigate("/")}
          style={{
            marginLeft: "10px",
            backgroundColor: "#007acc",
            color: "#fff",
            padding: "8px 12px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Back to Editor
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "10px", backgroundColor: "#090808", color: "#eee", minHeight: "100vh" }}>
      <h2>📦 Version History</h2>

      {/* ✅ Code Snapshot */}
      <textarea
        value={code || "// No code available"}
        readOnly
        style={{
          width: "100%",
          height: "140px",
          backgroundColor: "#2d2d2d",
          color: "#ccc",
          marginBottom: "8px",
          padding: "10px",
          border: "1px solid #444",
        }}
      />

      {/* ✅ Commit message input */}
      <input
        type="text"
        placeholder="Commit message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "10px",
          borderRadius: "4px",
          border: "1px solid #555",
        }}
      />

      {/* ✅ Buttons */}
      <div style={{ marginBottom: "12px" }}>
        <button
          onClick={saveVersion}
          style={{
            marginRight: "8px",
            padding: "8px 12px",
            backgroundColor: "#007acc",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          💾 Save Version
        </button>

        {recording ? (
          <button
            onClick={stopRecording}
            style={{ backgroundColor: "crimson", color: "#fff", padding: "8px 12px", borderRadius: "4px" }}
          >
            ⏹ Stop Recording
          </button>
        ) : (
          <button
            onClick={startRecording}
            style={{ backgroundColor: "limegreen", color: "#000", padding: "8px 12px", borderRadius: "4px" }}
          >
            🎙 Start Recording
          </button>
        )}
      </div>

      {/* ✅ Version List */}
      <h3>📜 Saved Versions</h3>
      {loading ? (
        <p>Loading versions...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {versions.length === 0 && <li>No versions found.</li>}
          {versions.map((v) => (
            <li
              key={v._id}
              style={{
                marginBottom: "10px",
                padding: "10px",
                backgroundColor: "#2d2d2d",
                borderRadius: "4px",
              }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(v._id)}
                  disabled={selectedIds.length === 2 && !selectedIds.includes(v._id)}
                  onChange={() => {
                    setSelectedIds((prev) =>
                      prev.includes(v._id)
                        ? prev.filter((id) => id !== v._id)
                        : [...prev, v._id]
                    );
                  }}
                />{" "}
                <strong>{new Date(v.savedAt).toLocaleString()}</strong> – {v.message || "(no message)"}
                <button
                  onClick={() => restoreVersion(v._id)}
                  style={{
                    marginLeft: "10px",
                    padding: "4px 8px",
                    backgroundColor: "#ff9800",
                    color: "#000",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ♻ Restore
                </button>
              </label>
              {v.audioPath && (
                <audio controls style={{ display: "block", marginTop: "8px" }}>
                  <source src={`http://localhost:5000${v.audioPath}`} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* ✅ Diff Result */}
      {diffResult && (
        <div style={{ marginTop: "16px" }}>
          <h3>🧾 Diff Result</h3>
          <pre
            style={{
              backgroundColor: "#2d2d2d",
              padding: "10px",
              overflowX: "auto",
              borderRadius: "4px",
            }}
          >
            {diffResult.map((part, idx) => (
              <span
                key={idx}
                style={{
                  color: part.added ? "lime" : part.removed ? "tomato" : "#fff",
                  display: "inline-block",
                }}
              >
                {part.value}
              </span>
            ))}
          </pre>
        </div>
      )}

      {/* ✅ Restored Code Card */}
      {restoredCode && (
        <div
          ref={restoredRef}
          style={{
            marginTop: "16px",
            backgroundColor: "#1e1e1e",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #333",
            position: "relative",
          }}
        >
          <h3>✅ Restored Code</h3>
          <pre
            style={{
              backgroundColor: "#2d2d2d",
              padding: "12px",
              borderRadius: "4px",
              maxHeight: "300px",
              overflowY: "auto",
              color: "#fff",
            }}
          >
            {restoredCode}
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(restoredCode);
              alert("Copied to clipboard!");
            }}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              backgroundColor: "#007acc",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
            }}
          >
            📋 Copy
          </button>
        </div>
      )}
    </div>
  );
}
