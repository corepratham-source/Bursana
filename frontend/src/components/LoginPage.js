import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LoginForm from "../components/LoginForm";
import { loginUser } from "../hooks/useAuth";

export default function LoginPage({ role = "customer", asModal = false, onClose, goToRegister }) {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async ({ identifier, password }) => {

    console.log("LOGIN BUTTON CLICKED");

    try {

      setLoading(true);

      const data = await loginUser({ identifier, password });

      console.log("LOGIN SUCCESS:", data);

      // Store token and user in localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("mode", role);

      if (asModal && onClose) {
        onClose();
      }

      if (role === "supplier") {
        navigate("/supplier/ingest");
      } else {
        window.location.reload();
      }

    } catch (err) {

      console.error("LOGIN ERROR:", err.response?.data || err.message);

      alert(err.response?.data?.error || "Login failed");

    } finally {

      setLoading(false);

    }
  };

  // Modal rendering with improved UI
  if (asModal) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999999,
        }}
        onClick={onClose}
      >
        <div
        style={{
          background: "white",
          borderRadius: "16px",
          width: "420px",
          padding: "28px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ✕
          </button>

          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "600", color: "#333" }}>
              {role === "supplier" ? "Supplier Login" : "Customer Login"}
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
              Sign in to continue
            </p>
          </div>

          <LoginForm onSubmit={handleLogin} loading={loading} />

          {goToRegister && (
            <p style={{ textAlign: "center", marginTop: "16px", color: "#6b7280" }}>
              Don't have an account?{" "}
              <span
                style={{ color: "#2563eb", cursor: "pointer", fontWeight: "500" }}
                onClick={goToRegister}
              >
                Register
              </span>
            </p>
          )}

        </div>
      </div>
    );
  }

  // Full page rendering
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f5f5" }}>

      <div style={{ width: "420px" }}>

        <div style={{ background: "white", borderRadius: "12px", padding: "40px", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)" }}>
          
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "600", color: "#333" }}>
              {role === "supplier" ? "Supplier Login" : "Customer Login"}
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
              Sign in to continue
            </p>
          </div>

          <LoginForm onSubmit={handleLogin} loading={loading} />

        </div>

      </div>

    </div>
  );
}
