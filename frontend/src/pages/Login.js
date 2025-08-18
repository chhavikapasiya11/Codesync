import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      alert(" Login successful!");
      navigate("/sessions");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed ❌");
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100" style={{ background: "#0a0c10", fontFamily: "Segoe UI, sans-serif" }}>
      <div className="p-4 text-white shadow-lg rounded-4" style={{ background: "#1b1e26", width: "400px" }}>
        <h2 className="text-center mb-3" style={{ color: "#00f0ff" }}> Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control bg-dark text-white border-0 rounded-3"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-4">
            <label>Password</label>
            <input
              type="password"
              className="form-control bg-dark text-white border-0 rounded-3"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn w-100 rounded-pill" style={{ background: "#00f0ff", color: "#000", fontWeight: "bold" }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
