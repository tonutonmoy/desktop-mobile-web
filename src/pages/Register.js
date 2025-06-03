import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:5000/api/v1/users/register", form);
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f0f2f5",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "1rem"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "0.5rem",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
          <div style={{ backgroundColor: "#25D366", borderRadius: "9999px", padding: "0.75rem", marginBottom: "1rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="40" height="40">
              <path d="..." />
            </svg>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#2d3748" }}>Create your account</h1>
          <p style={{ color: "#718096", marginTop: "0.5rem" }}>Join WhatsApp today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "1rem" }}>
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              value={form.lastName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            style={inputStyle}
          />
          {error && <div style={{ color: "red", fontSize: "0.875rem", textAlign: "center" }}>{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              color: "white",
              fontWeight: "600",
              backgroundColor: isLoading ? "#A0AEC0" : "#25D366",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background-color 0.3s"
            }}
          >
            {isLoading ? (
              <span style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <svg
                  style={{ marginRight: "0.5rem" }}
                  className="animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.25" />
                  <path
                    fill="white"
                    d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z"
                    opacity="0.75"
                  />
                </svg>
                Creating account...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "#718096" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#25D366", fontWeight: "500", textDecoration: "none" }}>
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

// Input styles reused
const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  border: "1px solid #CBD5E0",
  borderRadius: "0.5rem",
  outline: "none",
  fontSize: "1rem",
  boxSizing: "border-box"
};

export default Register;
