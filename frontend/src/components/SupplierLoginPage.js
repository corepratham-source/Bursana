import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function SupplierLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const res = await api.post("/auth/supplier/login", {
        identifier: email.trim()
      });
      
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("mode", "supplier");
      
      navigate("/supplier/ingest", { replace: true });
    } catch (err) {
      alert(err.response?.data?.error || "Supplier login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.loginPage}>
      <div style={styles.loginCard}>
        <h1 style={styles.loginTitle}>Supplier Portal</h1>
        <p style={styles.loginSubtitle}>Sign in to manage your products</p>
        
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter supplier email"
            style={styles.input}
            required
          />
          
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p style={styles.switchText}>
          Are you a customer?{" "}
          <button
            type="button"
            onClick={() => navigate("/customer")}
            style={styles.switchButton}
          >
            Login as Customer
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  loginPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
  },
  loginCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    textAlign: 'center',
  },
  loginTitle: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
  },
  loginSubtitle: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#666',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  switchText: {
    marginTop: '24px',
    fontSize: '14px',
    color: '#666',
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
};
