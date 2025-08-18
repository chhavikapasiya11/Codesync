import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Home.css";

export default function Home() {
const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const fadeInUp = {
    animation: "fadeInUp 1s ease-out",
  };

  return (
    <div style={{ background: "#0a0c10", color: "white", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Inline keyframe CSS */}
<style>
  {`
    @keyframes fadeInUp {
      0% { opacity: 0; transform: translateY(50px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }

    .fade-in-up {
      animation: fadeInUp 2.5s ease-out both;  /* was 1s, now slower */
    }

    .fade-in {
      animation: fadeIn 3s ease-in both;       /* was 1.5s, now slower */
    }
  `}
</style>


      <section
        className="hero d-flex align-items-center min-vh-100 px-3 py-4"
        style={{
          background: "radial-gradient(circle at top left, #1e222a, #0a0c10)",
          ...fadeInUp,
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 text-start">
              <h1 style={{ fontSize: "3.5rem", fontWeight: "800", color: "#38f9d7" }}>
                Welcome to <span style={{ color: "#00f0ff" }}>CodeSync</span>
              </h1>
              <p className="lead" style={{ color: "#9fa8b3", fontSize: "1.2rem" }}>
                Power-packed collaborative code editor with built-in Git workflows. Track, compare, commit, and roll back your code effortlessly.
              </p>
              <p style={{ color: "#c0c5cc" }}>
                Whether you're building solo or syncing live with a global dev team, CodeSync lets you code smarter — together.
              </p>
              <p style={{ color: "#c0c5cc" }}>
                Empower your workflow with instant version control, team commits, and even audio annotations.
              </p>
              <div className="mt-4">
                {!isLoggedIn ? (
                  <>
                    <Link to="/signup" className="btn btn-info me-3 px-4 py-2 rounded-pill shadow">
                      Sign Up
                    </Link>
                    <Link to="/login" className="btn btn-outline-light px-4 py-2 rounded-pill">
                      Log In
                    </Link>
                  </>
                ) : (
                  <Link to="/sessions" className="btn btn-success px-4 py-2 rounded-pill shadow">
                    Back to Session
                  </Link>
                )}
              </div>
            </div>
            <div className="col-lg-6 text-center mt-5 mt-lg-0">
              <img
                src="pc.webp"
                alt="Developer at Work"
                className="img-fluid rounded-4 shadow-lg"
                style={{ maxHeight: "300px" }}
              />
            </div>
          </div>
        </div>
      </section>
      <section className="features py-5 px-4 fade-in-up" style={{ background: "#111318" }}>
        <div className="container text-center">
          <h2 className="mb-5 fw-bold" style={{ color: "#00f0ff" }}>Why CodeSync?</h2>
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="p-4 rounded-4 shadow feature-box h-100" style={{ background: "#1b1e26" }}>
                <h4 style={{ color: "#29ff94" }}>Live Code Collaboration</h4>
                <p>Real-time syncing across all contributors — type, scroll, and work together instantly.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="p-4 rounded-4 shadow feature-box h-100" style={{ background: "#1b1e26" }}>
                <h4 style={{ color: "#38f9d7" }}>Commit & Save</h4>
                <p>Securely commit your changes. Save manually or auto-commit as you go.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="p-4 rounded-4 shadow feature-box h-100" style={{ background: "#1b1e26" }}>
                <h4 style={{ color: "#ffcb6b" }}>Rollback Code</h4>
                <p>Quickly restore to a stable version with just one click.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="p-4 rounded-4 shadow feature-box h-100" style={{ background: "#1b1e26" }}>
                <h4 style={{ color: "#77d4fc" }}>Version History</h4>
                <p>Browse every saved change. Explore and manage your version timeline effortlessly.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="p-4 rounded-4 shadow feature-box h-100" style={{ background: "#1b1e26" }}>
                <h4 style={{ color: "#ff928b" }}>Diff Viewer</h4>
                <p>Compare code versions side-by-side to spot exactly what changed.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="p-4 rounded-4 shadow feature-box h-100" style={{ background: "#1b1e26" }}>
                <h4 style={{ color: "#c3f584" }}>Secure & Private</h4>
                <p>Code is encrypted and access is permission-based — only your team sees what matters.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4 mx-md-auto">
              <div className="p-4 rounded-4 shadow feature-box h-100" style={{ background: "#1b1e26" }}>
                <h4 style={{ color: "#f5b4ff" }}>Audio Record Commit & Save</h4>
<p>
  Easily record voice notes to explain your changes and attach them to commits. Ideal for smoother communication, quick documentation, and team clarity.
</p>

              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="reviews py-5 px-4 fade-in-up" style={{ background: "#0d0f13" }}>
        <div className="container">
          <h2 className="text-center mb-5 fw-bold" style={{ color: "#00f0ff" }}>What Developers Say</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-4 bg-dark rounded-4 shadow h-100">
                <p>"CodeSync has changed how we collaborate. It feels like Google Docs, but for code — and with Git built-in!"</p>
                <div className="text-info fw-bold mt-3">— Anjali S., Full Stack Dev</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 bg-dark rounded-4 shadow h-100">
                <p>"The ability to instantly roll back broken changes saved my hackathon project! Love the diff view too!"</p>
                <div className="text-warning fw-bold mt-3">— Rishi P., Hackathon Enthusiast</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 bg-dark rounded-4 shadow h-100">
                <p>"Version control and collaboration never felt this intuitive. Perfect for remote teams and solo workflows."</p>
                <div className="text-success fw-bold mt-3">— Tara V., DevOps Engineer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

     
      <footer className="py-4 fade-in" style={{ background: "#0a0c10", borderTop: "1px solid #2c2f36" }}>
        <div className="container d-flex justify-content-center align-items-center py-3">
          <div className="text-center fw-bold text-light">© 2025 CodeSync. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
