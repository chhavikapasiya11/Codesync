import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { toast, Toaster } from "react-hot-toast";

export default function GitVersionPanel() {
  const location = useLocation();
 const sessionId = location.state?.sessionId || localStorage.getItem("sessionId");
const token = location.state?.token || localStorage.getItem("token");
const files = location.state?.files || [];

  const [versions, setVersions] = useState([]);
  const [diffResult, setDiffResult] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [restoredFiles, setRestoredFiles] = useState([]);
  const [showCompareUI, setShowCompareUI] = useState(false); // ✅ NEW STATE
  const audioChunksRef = useRef([]);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current.emit("join-session", { sessionId });
    return () => socketRef.current.disconnect();
  }, [sessionId]);

  const combinedCode =
    files && files.length > 0
      ? files.map((file) => `// ${file.name}\n${file.content}`).join("\n\n")
      : "// No code available";

  useEffect(() => {
    if (restoredFiles.length > 0)
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [restoredFiles]);

  const fetchVersions = async () => {
    if (!sessionId || !token) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/versions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVersions(res.data);
    } catch {
      toast.error("Failed to fetch version history.");
    }
    setLoading(false);
  };

  const saveVersion = async () => {
    if (!sessionId || !token) return toast.error("Missing session ID or token");
    const currentFiles =
      files && files.length > 0 ? files : [{ name: "main.js", content: "// No files provided" }];

    const formData = new FormData();
    formData.append("sessionId", sessionId);
    formData.append("message", message || "(no message)");
    formData.append("files", JSON.stringify(currentFiles));

    if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      formData.append("audio", blob, "audio-note.webm");
    }

    try {
      await axios.post("http://localhost:5000/api/versions/save", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Version saved successfully!");
      fetchVersions();
      setMessage("");
      audioChunksRef.current = [];
    } catch {
      toast.error("Failed to save version.");
    }
  };

  const restoreVersion = async (versionId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/versions/restore",
        { versionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const restored = res.data.files;
      setRestoredFiles(restored);
      await axios.post(`http://localhost:5000/api/code/${sessionId}/files`, {
        files: restored,
      });
      socketRef.current.emit("code-change", { sessionId, files: restored });
      toast.success("Version restored successfully!");
    } catch {
      toast.error("Failed to restore version.");
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
      setDiffResult(res.data.diffs);
    } catch {
      toast.error("Failed to generate diff.");
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
    } catch {
      toast.error("Microphone access denied!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  useEffect(() => {
    if (sessionId && token) fetchVersions();
  }, [sessionId, token]);

  useEffect(() => {
  if (selectedIds.length < 2) setDiffResult(null);
}, [selectedIds]);

  return (
   <div
  style={{
    padding: "16px",
    paddingTop: "80px", // ✅ Add extra space so content is below navbar
    backgroundColor: "#121212",
    color: "#eee",
    minHeight: "100vh",
  }}
>

      <h2 marginBottom="10px">📦 Version History</h2>
      <Toaster position="top-right" />

      {/* Original Combined Code Preview */}
      <textarea
        value={combinedCode}
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

      <div style={{ marginBottom: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={saveVersion}
          style={{
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
            type="button"
            onClick={stopRecording}
            style={{
              backgroundColor: "crimson",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "4px",
            }}
          >
            ⏹ Stop Recording
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            style={{
              backgroundColor: "limegreen",
              color: "#000",
              padding: "8px 12px",
              borderRadius: "4px",
            }}
          >
            🎙 Start Recording
          </button>
        )}

        {/* ✅ Compare Versions Button */}
        <button
          onClick={() => setShowCompareUI(true)}
          style={{
            padding: "8px 12px",
            backgroundColor: "#2196f3",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🔍 Compare Versions
        </button>
      </div>

      {/* ✅ Compare UI Panel */}
      {showCompareUI && (
        <div
          style={{
            backgroundColor: "#1e1e1e",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #444",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ color: "#00e676", marginBottom: "10px" }}>
            Select exactly 2 versions to compare:
          </h3>
          <p style={{ fontSize: "14px", marginBottom: "8px", color: "#bbb" }}>
            Tick 2 checkboxes from the list below, then click Confirm.
          </p>
          <div>
            <button
              onClick={() => {
                if (selectedIds.length === 2) {
                  compareVersions();
                  setShowCompareUI(false);
                  setTimeout(() => {
                    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                  }, 500);
                } else {
                  toast.error("Please select exactly 2 versions first.");
                }
              }}
              style={{
                backgroundColor: selectedIds.length === 2 ? "#673ab7" : "#888",
                color: "#fff",
                border: "none",
                padding: "10px 16px",
                borderRadius: "6px",
                fontSize: "15px",
                cursor: selectedIds.length === 2 ? "pointer" : "not-allowed",
              }}
            >
              ✅ Confirm Compare
            </button>
            <button
              onClick={() => setShowCompareUI(false)}
              style={{
                marginLeft: "10px",
                padding: "10px 16px",
                backgroundColor: "#555",
                color: "#fff",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

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
                <strong>{new Date(v.savedAt).toLocaleString()}</strong> –{" "}
                {v.message || "(no message)"}
                <button
                  type="button"
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
                </audio>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* ✅ Restored Files Section */}
      {restoredFiles.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>✅ Restored Files</h3>
          {restoredFiles.map((file, idx) => (
            <div
              key={idx}
              style={{
                background: "#1e1e1e",
                padding: "12px",
                marginBottom: "16px",
                borderRadius: "6px",
                border: "1px solid #444",
              }}
            >
              <h4 style={{ color: "#00e676" }}>{file.name}</h4>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "14px",
                  backgroundColor: "#2d2d2d",
                  padding: "10px",
                  borderRadius: "4px",
                }}
              >
                {file.content}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Diff Result Section */}
      {diffResult && (
        <div style={{ marginTop: "20px" }}>
          <h3>🧾 Diff Result</h3>
          {diffResult.map((fileDiff, idx) => (
            <div
              key={idx}
              style={{
                background: "#1e1e1e",
                padding: "12px",
                marginBottom: "16px",
                borderRadius: "6px",
                border: "1px solid #444",
              }}
            >
              <h4 style={{ color: "#00e676" }}>{fileDiff.fileName}</h4>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "14px" }}>
                {fileDiff.diff.map((part, i) => {
                  let bg = part.added
                    ? "rgba(0,255,0,0.15)"
                    : part.removed
                    ? "rgba(231, 20, 20, 0.15)"
                    : "";
                  return (
                    <span key={i} style={{ backgroundColor: bg, display: "block" }}>
                      {part.value}
                    </span>
                  );
                })}
              </pre>
            </div>
          ))}
        </div>
      )}

      <div ref={bottomRef}></div>
    </div>
  );
}
