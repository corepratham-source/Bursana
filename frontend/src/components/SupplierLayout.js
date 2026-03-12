import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";

export default function SupplierLayout({ children }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const mode = localStorage.getItem("mode");
    
    if (!storedUser || mode !== "supplier") {
      navigate("/supplier");
      return;
    }
    
    try {
      setUser(JSON.parse(storedUser));
    } catch {
      navigate("/supplier");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("mode");
    navigate("/supplier");
  };

  if (!user) return null;

  return (
    <div style={styles.layout}>
      <header style={styles.banner}>
        <div style={styles.bannerBrand}>
          <img src="/icons/Logo.png" alt="Bursana" style={styles.bannerImage} />
        </div>

        <div style={styles.bannerActions}>
          <button style={styles.navButton} onClick={() => navigate("/supplier/ingest")}>
            <span>Product Ingestion</span>
          </button>
          
          <button style={styles.navButton} onClick={() => navigate("/supplier/manage")}>
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
                <button style={styles.dropdownItem} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  layout: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  banner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px",
    height: "70px",
    background: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  bannerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  bannerImage: {
    width: "100px",
    height: "auto",
  },
  bannerText: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
  },
  bannerActions: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  navButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#f5f5f5",
    color: "#333",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  userWrapper: {
    position: "relative",
  },
  userIconButton: {
    padding: "8px",
    borderRadius: "50%",
    border: "none",
    background: "#f5f5f5",
    cursor: "pointer",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "8px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    overflow: "hidden",
    zIndex: 200,
  },
  dropdownItem: {
    display: "block",
    width: "100%",
    padding: "12px 24px",
    border: "none",
    background: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    color: "#333",
  },
  main: {
    flex: 1,
    marginTop: "70px",
    padding: "24px",
    background: "#f5f5f5",
  },
};
