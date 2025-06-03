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
    <div style={styles.wrapper}>
      <div style={styles.leftSection}>
        <h1 style={styles.logo}>facebook</h1>
        <p style={styles.description}>
          Facebook helps you connect and share with the people in your life.
        </p>
      </div>

      <div style={styles.rightSection}>
        <form onSubmit={handleSubmit} style={styles.card}>
          <h2 style={styles.heading}>Create a new account</h2>
          <p style={styles.subheading}>It’s quick and easy.</p>

          <div style={styles.inputGroup}>
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange}
              required
              style={styles.inputHalf}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              value={form.lastName}
              onChange={handleChange}
              required
              style={styles.inputHalf}
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="New password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            style={styles.input}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.registerButton,
              backgroundColor: isLoading ? "#6c8ddf" : "#42b72a",
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>

          <p style={styles.loginText}>
            Already have an account?{" "}
            <a href="/login" style={styles.loginLink}>Log In</a>
          </p>
        </form>
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
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    flexWrap: "wrap"
  },
  leftSection: {
    flex: 1,
    paddingRight: "2rem",
    minWidth: "300px"
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
    padding: "2rem",
    borderRadius: "0.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  },
  heading: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1c1e21",
    marginBottom: "0.25rem"
  },
  subheading: {
    fontSize: "0.9rem",
    color: "#606770",
    marginBottom: "1rem"
  },
  inputGroup: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem"
  },
  inputHalf: {
    flex: "1 1 48%",
    padding: "0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid #dddfe2",
    fontSize: "1rem",
    boxSizing: "border-box"
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid #dddfe2",
    fontSize: "1rem",
    boxSizing: "border-box"
  },
  registerButton: {
    padding: "0.75rem",
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "white",
    border: "none",
    borderRadius: "0.5rem"
  },
  loginText: {
    textAlign: "center",
    fontSize: "0.875rem",
    marginTop: "1rem",
    color: "#606770"
  },
  loginLink: {
    color: "#1877f2",
    fontWeight: "500",
    textDecoration: "none"
  },
  error: {
    color: "#dc3545",
    fontSize: "0.875rem",
    textAlign: "center"
  }
};

export default Register;
