import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function CustomerBanner({ bannerLogoUrl, cartCount = 0, wishlistCount = 0, onCartClick, onLogout, showLoginPopup, onShowLogin, user }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Categories", to: "/categories" },
    { label: "Best Sellers", to: "/best-sellers" },
  ];

  // Multicolour BURSANA exactly as in image
  const logoLetters = [
    { char: "B", color: "#3b82f6" },
    { char: "U", color: "#8b5cf6" },
    { char: "R", color: "#ec4899" },
    { char: "S", color: "#10b981" },
    { char: "A", color: "#f59e0b" },
    { char: "N", color: "#ef4444" },
    { char: "A", color: "#6366f1" },
  ];

  const badgeText = cartCount > 99 ? "99+" : String(cartCount);
  const wishlistBadgeText = wishlistCount > 99 ? "99+" : String(wishlistCount);

  return (
    <header
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 2000,
        height: 70,
        background: "#ffffff",
        boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* ── Logo ── */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
          {bannerLogoUrl && (
            <img src={bannerLogoUrl} alt="logo"
              style={{ height: 38, width: "auto", objectFit: "contain" }} />
          )}
        </Link>

        {/* ── Desktop Nav ── */}
        {!isMobile && (
          <nav style={{ display: "flex", alignItems: "center", gap: 36 }}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  textDecoration: "none",
                  color: "#444",
                  fontSize: 14,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* ── Right Icons ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>

          {/* Wishlist / Heart icon */}
          <button 
            style={{ ...iconBtn, position: "relative" }} 
            aria-label="Wishlist"
            onClick={() => navigate("/wishlist")}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlistCount > 0 && (
              <span style={{
                position: "absolute", top: 3, right: 3,
                minWidth: 16, height: 16, padding: "0 3px",
                borderRadius: 999, background: "#e53935",
                color: "#fff", fontSize: 9, fontWeight: 700,
                lineHeight: "16px", textAlign: "center",
                border: "2px solid #fff", boxSizing: "border-box",
              }}>
                {wishlistBadgeText}
              </span>
            )}
          </button>

          {/* Cart icon */}
          <button
            style={{ ...iconBtn, position: "relative" }}
            aria-label="Cart"
            onClick={() => (onCartClick ? onCartClick() : navigate("/cart"))}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: 3, right: 3,
                minWidth: 16, height: 16, padding: "0 3px",
                borderRadius: 999, background: "#e53935",
                color: "#fff", fontSize: 9, fontWeight: 700,
                lineHeight: "16px", textAlign: "center",
                border: "2px solid #fff", boxSizing: "border-box",
              }}>
                {badgeText}
              </span>
            )}
          </button>

          {/* User icon + dropdown - show login if not logged in */}
          {user ? (
            <div
              ref={dropdownRef}
              style={{ position: "relative" }}
            >
              <button 
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: "1.5px solid #ddd", background: "#fff",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#555",
                }}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              {menuOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  background: "#fff", border: "1px solid #e5e5e5",
                  borderRadius: 10, boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
                  minWidth: 155, zIndex: 3000, overflow: "hidden",
                }}>
                  <Link to="/orders" style={dropItem} onClick={() => setMenuOpen(false)}>
                    My Orders
                  </Link>
                  <Link to="/wishlist" style={dropItem} onClick={() => setMenuOpen(false)}>
                    Wishlist
                  </Link>
                  <Link to="/cart" style={dropItem} onClick={() => setMenuOpen(false)}>
                    Cart
                  </Link>
                  <button style={{ ...dropItem, borderTop: "1px solid #f0f0f0" }} onClick={() => { setMenuOpen(false); onLogout(); }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "1.5px solid #ddd", background: "#fff",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#555",
              }}
              onClick={() => onShowLogin && onShowLogin()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          )}

          {/* Hamburger (mobile only) */}
          {isMobile && (
            <button style={iconBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen
                  ? <path d="M18 6L6 18M6 6l12 12" />
                  : <>
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </>}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          position: "absolute", top: 70, left: 0, right: 0,
          background: "#fff", borderBottom: "1px solid #eee",
          padding: "12px 20px", display: "flex", flexDirection: "column", gap: 2,
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.to} to={link.to}
              style={{ padding: "11px 14px", color: "#333", textDecoration: "none", fontSize: 15, fontWeight: 500, borderRadius: 8, display: "block" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

const iconBtn = {
  width: 38, height: 38, border: "none", background: "transparent",
  cursor: "pointer", color: "#555", display: "flex",
  alignItems: "center", justifyContent: "center", borderRadius: "50%",
};

const dropItem = {
  display: "block", width: "100%", padding: "11px 16px",
  border: "none", background: "transparent", cursor: "pointer",
  textAlign: "left", fontSize: 13, color: "#333", textDecoration: "none",
};