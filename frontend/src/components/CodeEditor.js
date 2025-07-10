import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

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

  const handleKnowClick = (line) => {
    setShowMessages((prev) => ({
      ...prev,
      [line]: !prev[line],
    }));
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#1e1e1e",
        color: "#ccc",
        fontFamily: "monospace",
      }}
    >
      <div style={{ padding: "10px", backgroundColor: "#333", color: "#fff" }}>
        <strong>🧠 CodeSync Editor</strong>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            marginLeft: "20px",
            padding: "6px",
            backgroundColor: "#222",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "4px",
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
            marginLeft: "20px",
            padding: "6px 12px",
            backgroundColor: "#007acc",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ▶ Run Code
        </button>
      </div>

      <div style={{ flexGrow: 1, display: "flex", flexDirection: "row" }}>
        <div style={{ flex: 2 }}>
          <Editor
            height="100%"
            theme="vs-dark"
            language={
              language === "html"
                ? "html"
                : language === "cpp"
                ? "cpp"
                : language === "c"
                ? "c"
                : language === "java"
                ? "java"
                : language === "python"
                ? "python"
                : language === "php"
                ? "php"
                : language === "ruby"
                ? "ruby"
                : language === "go"
                ? "go"
                : language === "typescript"
                ? "typescript"
                : "javascript"
            }
            value={code}
            onChange={handleChange}
            onMount={handleMount}
          />

          {lintErrors.length > 0 && (
            <div
              style={{
                background: "#252526",
                color: "#ffc107",
                padding: "10px",
                borderTop: "1px solid #333",
                maxHeight: "150px",
                overflowY: "auto",
              }}
            >
              {lintErrors.map((err, idx) => (
                <div key={idx}>
                  ⚠ Line {err.line}: {err.message} <em>({err.ruleId})</em>{" "}
                  <button
                    onClick={() => handleKnowClick(err.line)}
                    style={{
                      marginLeft: "10px",
                      background: "transparent",
                      color: "#09f",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showMessages[err.line] ? "Hide" : "Know"}
                  </button>
                  {showMessages[err.line] && (
                    <div style={{ marginLeft: "20px", color: "#aaa" }}>
                      {err.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#1e1e1e",
            borderLeft: "1px solid #333",
            overflowY: "auto",
          }}
        >
          <div style={{ padding: "10px", color: "#0ff", fontWeight: "bold" }}>
            TERMINAL
          </div>
          <div style={{ padding: "10px", color: "#0f0" }}>
            <pre style={{ whiteSpace: "pre-wrap" }}>{output || "(no output)"}</pre>
            {error && (
              <>
                <div style={{ color: "#f55", fontWeight: "bold" }}>ERROR</div>
                <pre style={{ color: "#f55", whiteSpace: "pre-wrap" }}>{error}</pre>
              </>
            )}
          </div>

          {language === "html" && (
            <div style={{ padding: "10px" }}>
              <h4 style={{ color: "#0ff" }}>Live Preview</h4>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
