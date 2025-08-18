import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // Hover state for buttons
  const [hoveredBtn, setHoveredBtn] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        backgroundColor: "#1c1c1c",
        padding: "13px 20px",
        boxShadow: "0 0 5px #00ffff",
        borderBottom: "1px solid #00ffff",
      }}
    >
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7pG4vFMccBroauhj3gkEJyRZs-OOqvBj49HaFzHUnoNss-XRwgGyEqmz9cyATX5Oggr4&usqp=CAU"
            alt="CodeSync Logo"
            style={{
              height: "40px",
              width: "40px",
              borderRadius: "50%",
              marginRight: "12px",
              border: "2px solid #00ffff",
            }}
          />
          <Link
            to="/"
            style={{
              color: "#00ffff",
              fontSize: "22px",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            CodeSync
          </Link>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ borderColor: "#00ffff" }}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center" style={{ gap: "15px" }}>
            <li className="nav-item">
              <NavLink
                exact="true"
                to="/"
                className="nav-link"
                style={({ isActive }) => ({
                  color: isActive ? "#00ffff" : "#fff",
                  fontWeight: isActive ? "bold" : "normal",
                })}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/about"
                className="nav-link"
                style={({ isActive }) => ({
                  color: isActive ? "#00ffff" : "#fff",
                  fontWeight: isActive ? "bold" : "normal",
                })}
              >
                About
              </NavLink>
            </li>

            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <NavLink to="/sessions">
                    <button
                      onMouseEnter={() => setHoveredBtn("sessions")}
                      onMouseLeave={() => setHoveredBtn("")}
                      style={{
                        backgroundColor: hoveredBtn === "sessions" ? "#00e0e0" : "#00ffff",
                        color: "#000",
                        border: "none",
                        padding: "6px 16px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        transition: "background-color 0.3s ease",
                      }}
                    >
                      Sessions
                    </button>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    onMouseEnter={() => setHoveredBtn("logout")}
                    onMouseLeave={() => setHoveredBtn("")}
                    style={{
                      backgroundColor: hoveredBtn === "logout" ? "#ed2f0dff" : "transparent",
                      color: hoveredBtn === "logout" ? "#000" : "#ed2f0dff",
                      border: "2px solid #ed2f0dff",
                      padding: "6px 16px",
                      borderRadius: "20px",
                      fontWeight: "bold",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/signup">
                    <button
                      style={{
                        backgroundColor: "#00ffff",
                        color: "#000",
                        border: "none",
                        padding: "6px 16px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                      }}
                    >
                      Sign Up
                    </button>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/login">
                    <button
                      style={{
                        backgroundColor: "transparent",
                        color: "#00ffff",
                        border: "2px solid #00ffff",
                        padding: "6px 16px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                      }}
                    >
                      Login
                    </button>
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
