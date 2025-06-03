import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      setError("Invalid email or password. Please try again.");
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
        backgroundColor: "#ffffff",
        padding: "2rem",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
          <div style={{ backgroundColor: "#25D366", borderRadius: "9999px", padding: "0.75rem", marginBottom: "1rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="40" height="40">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-6.29-3.51c.245.174.547.266.844.266.297 0 .591-.09.85-.266.244-.174.432-.42.54-.706a1.6 1.6 0 000-1.217 1.558 1.558 0 00-.54-.706 1.622 1.622 0 00-1.694 0 1.558 1.558 0 00-.54.706 1.6 1.6 0 000 1.217c.108.286.296.532.54.706zM12 22a9.999 9.999 0 008.617-4.892 9.966 9.966 0 002.383-6.108c0-5.523-4.477-10-10-10S2 6.477 2 12a9.966 9.966 0 002.383 6.108A9.999 9.999 0 0012 22z" />
            </svg>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937" }}>WhatsApp Web</h1>
          <p style={{ color: "#4b5563", marginTop: "0.5rem" }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                outline: "none"
              }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                outline: "none"
              }}
            />
          </div>

          {error && (
            <div style={{ color: "#ef4444", fontSize: "0.875rem", textAlign: "center" }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              color: "white",
              fontWeight: "600",
              backgroundColor: isLoading ? "#9ca3af" : "#25D366",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s"
            }}
          >
            {isLoading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg
                  style={{ animation: "spin 1s linear infinite", marginRight: "0.5rem", height: "1rem", width: "1rem" }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    style={{ opacity: "0.25" }}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    style={{ opacity: "0.75" }}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "#4b5563" }}>
          New to WhatsApp?{" "}
          <a href="/register" style={{ color: "#25D366", fontWeight: "500", textDecoration: "none" }}>
            Create account
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
