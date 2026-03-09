import { useState } from "react";
import api from "../api";
import useAlert from "../hooks/useAlert";
import { socket } from "../socket";

export default function LoginPage({
  onLogin,
  goToRegister,
  asModal = false,
  onClose,
}) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  /* ================= LOGIN ================= */

  const login = async () => {
    try {
      setLoading(true);
      
      const res = await api.post("/auth/login", {
        identifier,
        password,
      });

      socket.connect();
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("mode", "customer");
      onLogin({ ...res.data.user, mode: "customer" });

      showAlert("Login successful!", "success");
    } catch (err) {
      showAlert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div
      style={asModal ? modalOverlay : page}
      onClick={asModal ? onClose : undefined}
    >
      <div
        style={asModal ? modalContainer : container}
        onClick={asModal ? (e) => e.stopPropagation() : undefined}
      >
        {asModal && (
          <button style={closeButton} onClick={onClose}>
            ✕
          </button>
        )}

        <div style={header}>
          <h2 style={title}>Welcome Back</h2>
          <p style={subtitle}>Sign in to continue</p>
        </div>

        <div style={form}>
          <div style={inputGroup}>
            <label style={label}>Email or Phone</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={input}
              placeholder="Enter your email or phone"
            />
          </div>

          <div style={inputGroup}>
            <label style={label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={input}
              placeholder="Enter your password"
            />
          </div>

          <button
            onClick={login}
            disabled={loading}
            style={button}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p style={registerText}>
            Don't have an account?{" "}
            <button
              onClick={goToRegister}
              style={registerButton}
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f5f5f5",
  padding: "20px",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "20px",
};

const modalContainer = {
  background: "white",
  borderRadius: "12px",
  padding: "32px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
  position: "relative",
};

const container = {
  background: "white",
  borderRadius: "12px",
  padding: "32px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
};

const closeButton = {
  position: "absolute",
  top: "12px",
  right: "12px",
  background: "none",
  border: "none",
  fontSize: "20px",
  cursor: "pointer",
  color: "#666",
};

const header = {
  textAlign: "center",
  marginBottom: "24px",
};

const title = {
  margin: "0 0 8px 0",
  fontSize: "24px",
  fontWeight: "600",
  color: "#333",
};

const subtitle = {
  margin: 0,
  fontSize: "14px",
  color: "#666",
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const label = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#333",
};

const input = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s",
};

const button = {
  padding: "14px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "opacity 0.2s",
};

const registerText = {
  textAlign: "center",
  fontSize: "14px",
  color: "#666",
  margin: 0,
};

const registerButton = {
  background: "none",
  border: "none",
  color: "#667eea",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "14px",
};
