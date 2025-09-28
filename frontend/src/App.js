import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";     
import Signup from "./pages/Signup";
import Login from './pages/Login';
import Navbar from "./components/Navbar";
import SessionPage from "./pages/SessionPage";
import CodeEditor from "./components/CodeEditor"; 
import GitVersionPanel from "./components/GitVersionPanel"; 

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sessions" element={<SessionPage />} />
        <Route path="/editor/:sessionId" element={<CodeEditor />} /> {/* Editor route */}
         <Route path="/git-panel" element={<GitVersionPanel />} /> 
      </Routes>
    </Router>
  );
}

export default App;
