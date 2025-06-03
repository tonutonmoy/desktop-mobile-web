import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
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
      const res = await axios.post("http://localhost:5000/api/v1/auth/login", form);
      localStorage.setItem("user", JSON.stringify(res.data.data));
      navigate("/home");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.leftSection}>
        <h1 style={styles.logo}>facebook</h1>
        <p style={styles.description}>
          Facebook helps you connect and share with the people in your life.
        </p>
      </div>

      <div style={styles.rightSection}>
        <form onSubmit={handleSubmit} style={styles.card}>
          <input
            type="email"
            name="email"
            placeholder="Email or phone number"
            value={form.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.loginButton,
              backgroundColor: isLoading ? "#6c8ddf" : "#1877f2",
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>

          <a href="#" style={styles.forgotPassword}>Forgotten password?</a>

          <hr style={styles.hr} />

          <Link to="/register" style={styles.createButton}>
            Create New Account
          </Link>
        </form>
        <p style={styles.footerText}>
          <strong>Create a Page</strong> for a celebrity, brand or business.
        </p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  leftSection: {
    flex: 1,
    paddingRight: "2rem"
  },
  logo: {
    color: "#1877f2",
    fontSize: "4rem",
    fontWeight: "bold",
    marginBottom: "1rem"
  },
  description: {
    fontSize: "1.5rem",
    lineHeight: "2rem",
    color: "#1c1e21"
  },
  rightSection: {
    flex: "none",
    width: "100%",
    maxWidth: "400px"
  },
  card: {
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  },
  input: {
    padding: "0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid #dddfe2",
    fontSize: "1rem"
  },
  loginButton: {
    padding: "0.75rem",
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "white",
    border: "none",
    borderRadius: "0.5rem"
  },
  forgotPassword: {
    textAlign: "center",
    color: "#1877f2",
    fontSize: "0.9rem",
    textDecoration: "none"
  },
  hr: {
    border: "none",
    height: "1px",
    backgroundColor: "#dddfe2",
    margin: "0.5rem 0"
  },
  createButton: {
    backgroundColor: "#42b72a",
    color: "white",
    fontWeight: "bold",
    padding: "0.75rem",
    textAlign: "center",
    borderRadius: "0.5rem",
    textDecoration: "none",
    display: "block"
  },
  error: {
    color: "#dc3545",
    fontSize: "0.875rem",
    textAlign: "center"
  },
  footerText: {
    fontSize: "0.875rem",
    color: "#1c1e21",
    textAlign: "center",
    marginTop: "1rem"
  }
};

export default Login;
