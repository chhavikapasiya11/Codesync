import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import API from "../api"; 

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use API.js instance instead of axios directly
      const res = await API.post("/auth/signup", formData);
      setMsg(res.data.msg);

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");

      navigate("/sessions"); 
    } catch (err) {
      setMsg(err.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100" style={{ background: "#0a0c10", fontFamily: "Segoe UI, sans-serif" }}>
      <div className="card p-4 text-white shadow-lg rounded-4" style={{ background: "#1b1e26", width: "400px" }}>
        <h2 className="text-center mb-3" style={{ color: "#38f9d7" }}> Sign Up</h2>
        {msg && <div className="alert alert-info text-center">{msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>Name</label>
            <input
              type="text"
              name="name"
              className="form-control bg-dark text-white border-0 rounded-3"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control bg-dark text-white border-0 rounded-3"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group mb-4">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control bg-dark text-white border-0 rounded-3"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" className="btn w-100 rounded-pill" style={{ background: "#00f0ff", color: "#000", fontWeight: "bold" }}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
