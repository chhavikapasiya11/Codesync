import "./App.css";
import CodeEditor from "./components/CodeEditor";

function App() {
  return (
    <div className="App">
      <h1>CodeSync - Real-time Editor</h1>
      <CodeEditor sessionId="session1" userId="user123" />
    </div>
  );
}

export default App;
