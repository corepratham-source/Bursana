import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SupplierBanner({
  bannerLogoUrl,
  onLogout,
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Use local tap-icon if no bannerLogoUrl provided
  const logoSrc = bannerLogoUrl || "/icons/tap-icon.png";

  return (
    <header style={styles.header}>
        <div style={styles.brand}>
            <img src={logoSrc} alt="Bursana" style={styles.brandImage} />
        </div>

      <div style={styles.headerActions}>
        {/* Ingestion */}
        <button 
            type="button"
            style={styles.navButton} 
            onClick={() => navigate("/supplier/ingest")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.navIcon}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span>Product Ingestion</span>
        </button>

        {/* Manage */}
        <button
          type="button"
          style={styles.navButton}
          onClick={() => navigate("/supplier/manage")}
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.navIcon}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>Product Manage</span>
        </button>

        {/* User Icon */}
        <div
          style={styles.userWrapper}
          onClick={() => setMenuOpen(true)}
          onMouseLeave={() => setTimeout(() => setMenuOpen(false), 500)}
        >
          <button style={styles.userIconButton}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>

          {menuOpen && (
            <div style={styles.dropdown}>
              <button
                style={styles.dropdownItem}
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2000,
    height: 70,
    background: "#ffffff",
    borderBottom: "1px solid #e5e5e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  brandLink: {
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
  },
  brandImage: {
    height: 44,
    width: 44,
    objectFit: "contain",
    borderRadius: "8px",
  },
  brandText: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1a1a1a",
    letterSpacing: "1px",
    fontFamily: "Georgia, serif",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "none",
    background: "transparent",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    color: "#555",
    padding: "10px 16px",
    borderRadius: "8px",
    transition: "background-color 0.2s, color 0.2s",
  },
  navIcon: {
    opacity: 0.7,
  },
  userIconButton: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "1px solid #e0e0e0",
    background: "white",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    padding: 0,
    transition: "border-color 0.2s",
  },

  userWrapper: {
    position: "relative",
    display: "inline-block",
  },
  
  dropdown: {
    position: "absolute",
    right: 0,
    top: "100%",
    marginTop: 8,
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    minWidth: 140,
    zIndex: 3000,
    overflow: "hidden",
  },
  dropdownItem: {
    width: "100%",
    padding: "12px 16px",
    border: "none",
    background: "white",
    cursor: "pointer",
    textAlign: "left",
    fontSize: 14,
    color: "#333",
    transition: "background-color 0.2s",
  },
};