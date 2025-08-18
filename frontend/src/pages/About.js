import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const About = () => {
  return (
    <div
      style={{
        backgroundColor: "#1e1e1e",
        color: "#ffffff",
        minHeight: "100vh",
        padding: "60px 20px",
        fontFamily: "Segoe UI, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "60px",
      }}
    >
      {/* Application Introduction */}
      <section style={{ maxWidth: "900px", textAlign: "center" }}>
       <h2
  style={{
    color: "#00ffff",
    marginTop: "40px",   // 👈 Add this for space from top
    marginBottom: "20px",
    fontSize: "2.5rem",
    fontWeight: "bold",
  }}
>
What is CodeSync?
</h2>

        <p
          style={{
            color: "#bbbbbb",
            fontSize: "1.2rem",
            lineHeight: "1.9",
            fontWeight: "500",
          }}
        >
          <strong>CodeSync</strong> is a real-time collaborative coding platform
          built for speed, efficiency, and teamwork. With features like{" "}
          <strong>live sync</strong>, <strong>versioning</strong>,{" "}
          <strong>terminal output</strong>, <strong>HTML preview</strong>,{" "}
          <strong>linting</strong>, and <strong>multi-language execution</strong>,
          CodeSync streamlines the entire development workflow — from coding to
          debugging to deployment.
        </p>
      </section>

      {/* Divider */}
      <div
        style={{
          width: "70%",
          height: "2px",
          background: "linear-gradient(to right, transparent, #00ffff, transparent)",
          margin: "20px 0",
          boxShadow: "0 0 12px #00ffff",
        }}
      ></div>

      {/* Developer Introduction */}
      <section style={{ maxWidth: "600px", textAlign: "center" }}>
        <h2
          style={{
            color: "#00ffff",
            fontSize: "1.8rem",
            marginBottom: "20px",
            fontWeight: "bold",
          }}
        >
          👩‍💻 Meet the Developer
        </h2>

        <img
          src="/myphoto.jpeg"
          alt="Developer"
          style={{
            width: "130px",
            height: "130px",
            borderRadius: "50%",
            border: "2px solid #00ffff",
            marginBottom: "15px",
            objectFit: "cover",
            boxShadow: "0 0 15px rgba(0, 255, 255, 0.4)",
          }}
        />

        <h3
          style={{
            fontSize: "1.5rem",
            color: "#00ffff",
            marginBottom: "8px",
            fontWeight: "bold",
          }}
        >
          Chhavi Kapasiya
        </h3>
        <p
          style={{
            color: "#cccccc",
            marginBottom: "12px",
            fontWeight: "500",
            fontSize: "1.05rem",
          }}
        >
          Founder & Backend Developer
        </p>

        <p
          style={{
            color: "#bbbbbb",
            fontSize: "1rem",
            lineHeight: "1.6",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          Hi, I’m Chhavi, a backend-focused developer who enjoys building
          scalable, secure, and efficient systems with{" "}
          <strong>Node.js</strong>, <strong>Express</strong>,{" "}
          <strong>MongoDB</strong>, and REST APIs.
        </p>

        {/* Social Links */}
        <div
          style={{
            marginTop: "18px",
            display: "flex",
            gap: "20px",
            fontSize: "1.6rem",
            justifyContent: "center",
          }}
        >
          <a
            href="https://github.com/chhavikapasiya11"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#00ffff", transition: "0.3s" }}
            onMouseOver={(e) => (e.target.style.color = "#ffffff")}
            onMouseOut={(e) => (e.target.style.color = "#00ffff")}
          >
            <FaGithub />
          </a>
          <a
            href="https://linkedin.com/in/your-linkedin"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#00ffff", transition: "0.3s" }}
            onMouseOver={(e) => (e.target.style.color = "#ffffff")}
            onMouseOut={(e) => (e.target.style.color = "#00ffff")}
          >
            <FaLinkedin />
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;
