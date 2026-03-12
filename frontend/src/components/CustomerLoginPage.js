import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import useAlert from "../hooks/useAlert";
import { socket } from "../socket";

export default function CustomerLoginPage() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [identifier, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Check if already logged in as customer
    const storedUser = localStorage.getItem("user");
    const mode = localStorage.getItem("mode");
    if (storedUser && mode === "customer") {
      navigate("/");
    }
  }, [navigate]);

  const login = async (e) => {
    e.preventDefault();

    try {

      const payload = {
        identifier: identifier.trim(),
        password: password.trim()
      };

      console.log("LOGIN PAYLOAD:", payload);

      const response = await api.post("/auth/login", payload);

      console.log("LOGIN RESPONSE:", response.data);

      const { token, user } = response.data;

      // Store token and user in localStorage
      if (token) {
        localStorage.setItem("token", token);
      }
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("mode", "customer");

      window.location.href = "/customer";

    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error.response?.data || error.message
      );

    }
  };

  const goToRegister = () => {
    navigate("/landing");
  };

  return (
    <div style={page}>
      <div style={container}>
        <div style={header}>
          <h2 style={title}>Customer Login</h2>
          <p style={subtitle}>Sign in to continue shopping</p>
        </div>

        <form onSubmit={login} style={form}>
          <div style={inputGroup}>
            <label style={label}>Email</label>
            <input
              type="identifier"
              value={identifier}
              onChange={(e) => setEmail(e.target.value)}
              style={input}
              placeholder="Enter your identifier"
              required
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
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={button}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p style={registerText}>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={goToRegister}
              style={registerButton}
            >
              Register
            </button>
          </p>
          
          <p style={switchText}>
            Are you a supplier?{" "}
            <button
              type="button"
              onClick={() => navigate("/supplier")}
              style={registerButton}
            >
              Login as Supplier
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f5f5f5",
  padding: "20px",
};

const container = {
  background: "white",
  borderRadius: "12px",
  padding: "32px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
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

const switchText = {
  textAlign: "center",
  fontSize: "14px",
  color: "#666",
  margin: 0,
  borderTop: "1px solid #eee",
  paddingTop: "16px",
};

const registerButton = {
  background: "none",
  border: "none",
  color: "#667eea",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "14px",
};
