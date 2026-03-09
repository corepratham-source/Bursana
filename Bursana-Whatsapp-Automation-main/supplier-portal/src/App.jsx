import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';

// Production backend URL
const BACKEND_URL = 'https://bursana-backend-production.up.railway.app';

// Create axios instance
const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ================= SUPPLIER LOGIN ================= */

function SupplierLoginPage({ onLogin }) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/supplier/login', { identifier });
      
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('mode', 'supplier');
      
      onLogin(res.data.user);
      navigate('/ingest');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter your email"
            style={styles.input}
            required
          />
          
          {error && <p style={styles.error}>{error}</p>}
          
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ================= SUPPLIER BANNER ================= */

function SupplierBanner({ onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const logoSrc = "/icons/Logo.png";

  return (
    <header style={styles.banner}>
      <div style={styles.bannerBrand}>
        <img src={logoSrc} alt="Bursana" style={styles.bannerImage} />
        <span style={styles.bannerText}>BURSANA</span>
      </div>

      <div style={styles.bannerActions}>
        <button style={styles.navButton} onClick={() => navigate('/ingest')}>
          <span>Product Ingestion</span>
        </button>
        
        <button style={styles.navButton} onClick={() => navigate('/manage')}>
          <span>Product Manage</span>
        </button>

        <div style={styles.userWrapper}>
          <button 
            style={styles.userIconButton}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          
          {menuOpen && (
            <div style={styles.dropdown}>
              <button style={styles.dropdownItem} onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ================= SUPPLIER LAYOUT ================= */

function SupplierLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const mode = localStorage.getItem('mode');
    
    if (!storedUser || mode !== 'supplier') {
      navigate('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(storedUser));
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('mode');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={styles.layout}>
      <SupplierBanner onLogout={handleLogout} />
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

/* ================= PAGES ================= */

function ProductIngestionPage() {
  return (
    <div style={styles.page}>
      <h1>Product Ingestion</h1>
      <p>Upload and ingest products here.</p>
    </div>
  );
}

function ProductManagePage() {
  return (
    <div style={styles.page}>
      <h1>Product Management</h1>
      <p>Manage your products here.</p>
    </div>
  );
}

/* ================= MAIN APP ================= */

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const mode = localStorage.getItem('mode');
    
    if (storedUser && mode === 'supplier') {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // invalid user
      }
    }
  }, []);

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/ingest" replace /> : 
        <SupplierLoginPage onLogin={setUser} />
      } />
      
      <Route element={<SupplierLayout />}>
        <Route path="/ingest" element={<ProductIngestionPage />} />
        <Route path="/manage" element={<ProductManagePage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

/* ================= STYLES ================= */

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
  error: {
    color: 'red',
    fontSize: '14px',
    margin: 0,
  },
  layout: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  banner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    height: '70px',
    background: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  bannerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  bannerImage: {
    width: '80px',
    height: 'auto',
  },
  bannerText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  },
  bannerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  navButton: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#f5f5f5',
    color: '#333',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  userWrapper: {
    position: 'relative',
  },
  userIconButton: {
    padding: '8px',
    borderRadius: '50%',
    border: 'none',
    background: '#f5f5f5',
    cursor: 'pointer',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    zIndex: 200,
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '12px 24px',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
  },
  main: {
    flex: 1,
    marginTop: '70px',
    padding: '24px',
    background: '#f5f5f5',
  },
  page: {
    background: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
};
