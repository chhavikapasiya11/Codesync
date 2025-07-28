import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

export default function CodeEditor({ sessionId, userId }) {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState("");
  const [openTabs, setOpenTabs] = useState([]);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
const [fileToRename, setFileToRename] = useState(null);
const [renameValue, setRenameValue] = useState("");

const [showDeleteModal, setShowDeleteModal] = useState(false);
const [fileToDelete, setFileToDelete] = useState(null);


  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const iframeRef = useRef(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const activeFileData = files.find((f) => f.name === activeFile) || null;

  // ✅ Language Mapping
  const getMonacoLanguage = (ext) => {
    const map = {
      js: "javascript",
      ts: "typescript",
      py: "python",
      cpp: "cpp",
      java: "java",
      html: "html",
    };
    return map[ext] || "plaintext";
  };

  // ✅ Fetch files from backend
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/code/${sessionId}/files`
        );
        let updatedFiles = [];
        if (res.data.files?.length > 0) {
          updatedFiles = res.data.files.map((file) => ({
            ...file,
            language:
              file.language ||
              getMonacoLanguage(file.name.split(".").pop()),
          }));
        } else {
          updatedFiles = [
            { name: "main.js", content: "// Start coding...", language: "javascript" },
          ];
        }
        setFiles(updatedFiles);
        await axios.post(
          `http://localhost:5000/api/code/${sessionId}/files`,
          { files: updatedFiles }
        );
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    };
    fetchFiles();
  }, [sessionId]);

  // ✅ Socket Connection
  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current.emit("join-session", { sessionId, userId });

    socketRef.current.on("code-update", ({ files }) => files && setFiles(files));
    socketRef.current.on("terminal-result", ({ output, error }) => {
      setOutput(output);
      setError(error);
    });

    return () => socketRef.current.disconnect();
  }, [sessionId, userId]);

  // ✅ Persist files
  const persistFiles = async (updatedFiles) => {
    try {
      await axios.post(`http://localhost:5000/api/code/${sessionId}/files`, {
        files: updatedFiles,
      });
    } catch (err) {
      console.error("Error saving files:", err);
    }
  };

  // ✅ Handle Code Change
  const handleCodeChange = (value) => {
    if (!activeFileData) return;
    setFiles((prev) => {
      const updatedFiles = prev.map((file) =>
        file.name === activeFile ? { ...file, content: value } : file
      );
      socketRef.current.emit("code-change", { sessionId, files: updatedFiles });
      persistFiles(updatedFiles);
      return updatedFiles;
    });
  };

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    editorRef.current._monaco = monaco;
  };

  // ✅ Run Code
  const handleRun = async () => {
    if (!activeFileData) return;
    if (activeFileData.language === "html") {
      iframeRef.current.srcdoc = activeFileData.content;
      return;
    }
    const languageMap = {
      javascript: 63,
      python: 71,
      cpp: 54,
      java: 62,
      typescript: 74,
    };
    const languageId = languageMap[activeFileData.language];
    if (!languageId) return setError("Unsupported language for Judge0");

    try {
      const res = await axios.post("http://localhost:5000/api/run", {
        code: activeFileData.content,
        languageId,
      });
      setOutput(res.data.output || "");
      setError(res.data.error || "");
    } catch (err) {
      console.error(err);
      setError("Execution failed.");
    }
  };

  const handleOpenGitPanel = () => {
    navigate("/git-panel", { state: { sessionId, token, files } });
  };

  // ✅ Add New File
  const addNewFile = () => {
    if (!newFileName.trim()) return toast.error("File name cannot be empty!");
    if (files.some((f) => f.name === newFileName))
      return toast.error("File already exists!");
    const ext = newFileName.split(".").pop();
    const lang = getMonacoLanguage(ext);
    const updatedFiles = [
      ...files,
      { name: newFileName, content: "// New file", language: lang },
    ];
    setFiles(updatedFiles);
    socketRef.current.emit("code-change", { sessionId, files: updatedFiles });
    persistFiles(updatedFiles);
    toast.success(`New file "${newFileName}" added!`);
    setNewFileName("");
    setShowModal(false);
  };

  const handleOpenFile = (fileName) => {
    if (!openTabs.includes(fileName)) setOpenTabs([...openTabs, fileName]);
    setActiveFile(fileName);
  };

  const handleCloseTab = (fileName) => {
    const updatedTabs = openTabs.filter((n) => n !== fileName);
    setOpenTabs(updatedTabs);
    if (activeFile === fileName) setActiveFile(updatedTabs.slice(-1)[0] || "");
  };

  const handleSaveFile = () => {
    if (!activeFileData) return;
    const element = document.createElement("a");
    const file = new Blob([activeFileData.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = activeFileData.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveFile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFileData]);

  // ✅ Upload File
  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const ext = file.name.split(".").pop();
      const lang = getMonacoLanguage(ext);
      const updatedFiles = [
        ...files,
        { name: file.name, content, language: lang },
      ];
      setFiles(updatedFiles);
      socketRef.current.emit("code-change", { sessionId, files: updatedFiles });
      persistFiles(updatedFiles);
      toast.success(`Uploaded "${file.name}"`);
    };
    reader.readAsText(file);
  };

 const confirmRename = () => {
  if (!renameValue.trim() || renameValue === fileToRename) {
    setShowRenameModal(false);
    return;
  }
  if (files.some((f) => f.name === renameValue)) {
    toast.error("File already exists!");
    return;
  }

  const ext = renameValue.split(".").pop();
  const lang = getMonacoLanguage(ext);
  const updatedFiles = files.map((file) =>
    file.name === fileToRename ? { ...file, name: renameValue, language: lang } : file
  );

  setFiles(updatedFiles);
  setOpenTabs(openTabs.map((n) => (n === fileToRename ? renameValue : n)));
  if (activeFile === fileToRename) setActiveFile(renameValue);
  socketRef.current.emit("code-change", { sessionId, files: updatedFiles });
  persistFiles(updatedFiles);

  toast.success(`Renamed "${fileToRename}" → "${renameValue}"`);
  setShowRenameModal(false);
};

const confirmDelete = () => {
  const updatedFiles = files.filter((f) => f.name !== fileToDelete);
  const updatedTabs = openTabs.filter((n) => n !== fileToDelete);
  setFiles(updatedFiles);
  setOpenTabs(updatedTabs);
  if (activeFile === fileToDelete) setActiveFile(updatedTabs.slice(-1)[0] || "");
  socketRef.current.emit("code-change", { sessionId, files: updatedFiles });
  persistFiles(updatedFiles);

  toast.success(`Deleted "${fileToDelete}"`);
  setShowDeleteModal(false);
};

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#1e1e1e",
        color: "#ccc",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      <Toaster position="top-right" />

      {/* Sidebar */}
      <div
        style={{
          width: "160px",
          backgroundColor: "#252526",
          borderRight: "1px solid #444",
        }}
      >
        <div style={{ padding: "10px", fontWeight: "bold", color: "#0ff" }}>
          All Files
        </div>
        {files.map((file) => (
  <div
    key={file.name}
    onClick={() => handleOpenFile(file.name)}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 12px",
      backgroundColor: activeFile === file.name ? "#333" : "transparent",
      color: activeFile === file.name ? "#fff" : "#ccc",
      cursor: "pointer"
    }}
  >
    <span>{file.name}</span>
    <span style={{ display: "flex", gap: "6px" }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setFileToRename(file.name);
          setRenameValue(file.name);
          setShowRenameModal(true);
        }}
        style={{ background: "none", border: "none", color: "#0ff", cursor: "pointer" }}
      >
        ✏️
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setFileToDelete(file.name);
          setShowDeleteModal(true);
        }}
        style={{ background: "none", border: "none", color: "#f55", cursor: "pointer" }}
      >
        🗑️
      </button>
    </span>
  </div>
))}

      </div>

      {/* Main Area */}
      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            backgroundColor: "#000",
            color: "#fff",
            padding: "10px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #444",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "22px" }}>🚀 CODESYNC</h1>
            <span style={{ fontSize: "14px", color: "#bbb",marginLeft:"7px" }}>
              Real-Time Code Collaboration
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            {/* Upload Button */}
            <input
              type="file"
              onChange={handleUploadFile}
              style={{ display: "none" }}
              id="fileUpload"
            />
            <label
  htmlFor="fileUpload"
  style={{
    background: "linear-gradient(90deg, #6a11cb, #2575fc)", 
    color: "#fff",
    fontWeight: "bold",
    padding: "10px 18px",
    borderRadius: "6px",
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 0 8px rgba(37,117,252,0.4)",
    transition: "all 0.3s ease",
    display: "inline-block",
  }}
  onMouseEnter={(e) => {
    e.target.style.background = "linear-gradient(90deg, #2575fc, #6a11cb)";
    e.target.style.boxShadow = "0 0 15px rgba(37,117,252,0.8)";
    e.target.style.transform = "scale(1.05)";
  }}
  onMouseLeave={(e) => {
    e.target.style.background = "linear-gradient(90deg, #6a11cb, #2575fc)";
    e.target.style.boxShadow = "0 0 8px rgba(37,117,252,0.4)";
    e.target.style.transform = "scale(1)";
  }}
>
  📂 Upload
</label>

            {/* Run Button */}
          <button
  onClick={handleRun}
  style={{
    background: "linear-gradient(90deg, #00c853, #64dd17)", 
    color: "#fff",
    fontWeight: "bold",
    padding: "10px 18px",
    borderRadius: "6px",
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 0 8px rgba(0,200,83,0.4)",
    transition: "all 0.3s ease",
  }}
  onMouseEnter={(e) => {
    e.target.style.background = "linear-gradient(90deg, #64dd17, #00c853)";
    e.target.style.boxShadow = "0 0 15px rgba(0,200,83,0.8)";
    e.target.style.transform = "scale(1.05)";
  }}
  onMouseLeave={(e) => {
    e.target.style.background = "linear-gradient(90deg, #00c853, #64dd17)";
    e.target.style.boxShadow = "0 0 8px rgba(0,200,83,0.4)";
    e.target.style.transform = "scale(1)";
  }}
>
  ▶ Run
</button>

 <button
  onClick={handleSaveFile}
  style={{
    background: "linear-gradient(90deg, #ff9800, #f44336)", // Orange to Red gradient
    color: "#fff",
    fontWeight: "bold",
    padding: "10px 18px",
    borderRadius: "6px",
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 0 8px rgba(244,67,54,0.6)",
    transition: "0.3s ease-in-out",
  }}
  onMouseEnter={(e) => {
    e.target.style.transform = "scale(1.05)";
    e.target.style.boxShadow = "0 0 15px rgba(244,67,54,0.9)";
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = "scale(1)";
    e.target.style.boxShadow = "0 0 8px rgba(244,67,54,0.6)";
  }}
>
  💾 Save
</button>


<style>
{`
@keyframes softPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 8px rgba(0,230,118,0.5);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(0,230,118,0.8);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 8px rgba(0,230,118,0.5);
  }
}
`}
</style>

          <button
  onClick={handleOpenGitPanel}
  style={{
    background: "linear-gradient(90deg, #00e676, #00b0ff)",
    color: "#fff",
    fontWeight: "bold",
    padding: "10px 18px",
    borderRadius: "6px",
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 0 8px rgba(0,230,118,0.5)",
    animation: "softPulse 3s infinite ease-in-out",
    transition: "all 0.3s ease",
  }}
  onMouseEnter={(e) => {
    e.target.style.background = "linear-gradient(90deg, #00b0ff, #00e676)";
    e.target.style.boxShadow = "0 0 18px rgba(0,230,118,0.9)";
    e.target.style.transform = "scale(1.08)";
  }}
  onMouseLeave={(e) => {
    e.target.style.background = "linear-gradient(90deg, #00e676, #00b0ff)";
    e.target.style.boxShadow = "0 0 8px rgba(0,230,118,0.5)";
    e.target.style.transform = "scale(1)";
  }}
>
  🔍 Version Panel
</button>


          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#2d2d2d",
            borderBottom: "1px solid #444",
            overflowX: "auto",
          }}
        >
          {openTabs.map((fileName) => (
            <div
              key={fileName}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                backgroundColor:
                  activeFile === fileName ? "#1e1e1e" : "transparent",
                color: activeFile === fileName ? "#fff" : "#aaa",
                borderBottom:
                  activeFile === fileName ? "3px solid #00e676" : "none",
                marginRight: "5px",
                cursor: "pointer",
              }}
              onClick={() => setActiveFile(fileName)}
            >
              {fileName}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseTab(fileName);
                }}
                style={{
                  marginLeft: "8px",
                  cursor: "pointer",
                  color: "#f55",
                  fontWeight: "bold",
                }}
              >
                ✖
              </span>
            </div>
          ))}
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "linear-gradient(90deg, #8e2de2, #4a00e0)",
              color: "#fff",
              fontWeight: "bold",
              padding: "10px 15px",
              marginLeft: "0",
              borderRadius: "2px",
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 8px rgba(142,45,226,0.4)",
            }}
          >
            ➕ New File
          </button>
        </div>

        {/* Editor + Terminal */}
        <div style={{ flexGrow: 1, display: "flex" }}>
          <div style={{ flex: 2 }}>
            {activeFile ? (
              <Editor
                height="100%"
                theme="vs-dark"
                language={
                  files.find((f) => f.name === activeFile)?.language ||
                  "plaintext"
                }
                value={files.find((f) => f.name === activeFile)?.content || ""}
                onChange={handleCodeChange}
                onMount={handleMount}
              />
            ) : (
              <div style={{ color: "#ccc", padding: "20px" }}>
                Open a file from the sidebar to start coding.
              </div>
            )}
          </div>
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
            {activeFileData && activeFileData.language === "html" && (
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
      {/* ✅ Rename File Modal */}
{showRenameModal && (
  <div style={{
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000
  }}>
    <div style={{ background: "#1e1e1e", padding: "20px", borderRadius: "8px", width: "300px", textAlign: "center" }}>
      <h3 style={{ color: "#fff" }}>Rename File</h3>
      <input
        type="text"
        value={renameValue}
        onChange={(e) => setRenameValue(e.target.value)}
        placeholder="Enter new file name..."
        style={{
          width: "90%", padding: "10px", margin: "10px 0", background: "#2d2d2d",
          color: "#fff", border: "1px solid #444", borderRadius: "4px"
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={confirmRename}
          style={{ background: "linear-gradient(90deg, #00c853, #64dd17)", color: "#fff", padding: "8px 14px", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Rename
        </button>
        <button
          onClick={() => setShowRenameModal(false)}
          style={{ background: "#555", color: "#fff", padding: "8px 14px", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{/* ✅ Delete File Modal */}
{showDeleteModal && (
  <div style={{
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000
  }}>
    <div style={{ background: "#1e1e1e", padding: "20px", borderRadius: "8px", width: "300px", textAlign: "center" }}>
      <h3 style={{ color: "#fff" }}>Delete File</h3>
      <p style={{ color: "#ccc" }}>Are you sure you want to delete <b>{fileToDelete}</b>?</p>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={confirmDelete}
          style={{ background: "linear-gradient(90deg, #f44336, #e91e63)", color: "#fff", padding: "8px 14px", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Delete
        </button>
        <button
          onClick={() => setShowDeleteModal(false)}
          style={{ background: "#555", color: "#fff", padding: "8px 14px", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


      {/* Modal for New File */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#2d2a2a",
              padding: "20px",
              borderRadius: "8px",
              width: "300px",
              textAlign: "center",
            }}
          >
            <h3>Add New File</h3>
            <input
              type="text"
              placeholder="Enter file name"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                margin: "10px 0",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={addNewFile}
                style={{
                  background: "#00e676",
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Add
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "#f55",
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
