import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CodeEditor from "./components/CodeEditor";
import GitPanelPage from "./components/GitVersionPanel";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="App">
              <h1 style={{ textAlign: "center", color: "#fff" }}>
                CodeSync - Real-time Editor
              </h1>
              <CodeEditor sessionId="session1" userId="user123" />
            </div>
          }
        />

        {/* ✅ Git Version Panel */}
        <Route path="/git-panel" element={<GitPanelPage />} />
      </Routes>
    </Router>
  );
}

export default App;
