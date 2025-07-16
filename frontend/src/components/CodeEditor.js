import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

export default function CodeEditor({ sessionId, userId }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [lintErrors, setLintErrors] = useState([]);
  const [showMessages, setShowMessages] = useState({});
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const iframeRef = useRef(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
      withCredentials: true,
      
    });

    socketRef.current.emit("join-session", { sessionId, userId });

    socketRef.current.on("code-update", ({ code }) => {
      setCode(code);
    });

    socketRef.current.on("lint-errors", (errors) => {
      setLintErrors(errors);
      applyMarkers(errors);
    });

    socketRef.current.on("terminal-result", ({ output, error }) => {
      setOutput(output);
      setError(error);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [sessionId, userId]);

  const handleChange = (value) => {
    setCode(value);
    socketRef.current.emit("code-change", { sessionId, code: value });
  };

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    editorRef.current._monaco = monaco;
  };

  const applyMarkers = (errors) => {
    const monaco = editorRef.current._monaco;
    const model = editorRef.current.getModel();

    const markers = errors.map((err) => ({
      startLineNumber: err.line,
      endLineNumber: err.line,
      startColumn: err.column,
      endColumn: err.column + 1,
      message: err.message,
      severity:
        err.severity === "error"
          ? monaco.MarkerSeverity.Error
          : monaco.MarkerSeverity.Warning,
    }));

    monaco.editor.setModelMarkers(model, "eslint", markers);
  };

  const handleRun = () => {
    if (language === "html") {
      iframeRef.current.srcdoc = code;
    } else {
      socketRef.current.emit("terminal-output", {
        sessionId,
        codeToRun: code,
        language,
      });
    }
  };

  const handleOpenGitPanel = () => {
    navigate("/git-panel", {
      state: { sessionId, token, code },
    });
  };
  useEffect(() => {
  document.body.style.margin = "0";
  document.body.style.padding = "0";
}, []);

  return (
    <div
  style={{
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    margin: "0",    
    padding: "0",   
    backgroundColor: "#1e1e1e",
    color: "#ccc",
    fontFamily: "monospace",
    position: "absolute",  
    top: 0,
    left: 0,
    right: 0,
  }}
>

      {/* ✅ Modern Header */}
      <div
        style={{
          backgroundColor: "#000",
          color: "#fff",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #444",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          margin: 0,
        }}
      >
        <div style={{ margin: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
          >
            🚀 CODESYNC - LIVE COLLABORATION
          </h1>
          <span style={{ fontSize: "14px", color: "#bbb" }}>
            Real-Time Code Editing & Version Control
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: "6px",
              backgroundColor: "#222",
              color: "#fff",
              border: "1px solid #555",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="html">HTML/CSS</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="go">Go</option>
            <option value="typescript">TypeScript</option>
          </select>

          <button
            onClick={handleRun}
            style={{
              padding: "8px 14px",
              backgroundColor: "#00e676",
              color: "#000",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            ▶ Run Code
          </button>

          <button
            onClick={handleOpenGitPanel}
            style={{
              padding: "8px 14px",
              backgroundColor: "#ff9800",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            🔍 Version Panel
          </button>
        </div>
      </div>

      {/* ✅ Editor & Terminal Layout */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "row",
          height: "100%",
        }}
      >
        {/* Code Editor */}
        <div style={{ flex: 2 }}>
          <Editor
            height="100%"
            theme="vs-dark"
            language={language}
            value={code}
            onChange={handleChange}
            onMount={handleMount}
          />
        </div>

        {/* Terminal */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#121212",
            borderLeft: "1px solid #333",
            overflowY: "auto",
          }}
        >
          <div style={{ padding: "10px", color: "#0ff", fontWeight: "bold" }}>
            TERMINAL
          </div>
          <div style={{ padding: "10px", color: "#0f0" }}>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {output || "(no output)"}
            </pre>
            {error && (
              <>
                <div style={{ color: "#f55", fontWeight: "bold" }}>ERROR</div>
                <pre style={{ color: "#f55", whiteSpace: "pre-wrap" }}>
                  {error}
                </pre>
              </>
            )}
          </div>
          {language === "html" && (
            <iframe
              ref={iframeRef}
              title="Live Preview"
              style={{
                width: "100%",
                height: "300px",
                background: "white",
                border: "none",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
