import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const links = [
  { label: "Terms & Conditions", to: "/terms-and-conditions" },
  { label: "Refund Policy", to: "/refund-policy" },
  { label: "Shipping Policy", to: "/shipping-policy" },
  { label: "Privacy Policy", to: "/privacy-policy" },
];

export default function CustomerFooter() {
  const currentYear = new Date().getFullYear();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.brandSection}>
          <p style={styles.copy}>© {currentYear} Bursana. All rights reserved.</p>
        </div>
        
        <nav style={isMobile ? styles.linksWrapMobile : styles.linksWrap} aria-label="Policy links">
          {links.map((item) => (
            <Link key={item.to} to={item.to} style={styles.link}>
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div style={styles.socialSection}>
          <a href="#" style={styles.socialLink} aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="#" style={styles.socialLink} aria-label="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    borderTop: "1px solid #e5e5e5",
    background: "#fafafa",
    padding: "24px 16px",
    marginTop: "auto",
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  brandSection: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    height: 28,
    width: 28,
    objectFit: "contain",
    borderRadius: "6px",
  },
  copy: {
    margin: 0,
    fontSize: 13,
    color: "#666",
    letterSpacing: 0.3,
  },
  linksWrap: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
  },
  linksWrapMobile: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
    width: "100%",
    order: 3,
    marginTop: 12,
  },
  link: {
    color: "#444",
    textDecoration: "none",
    fontSize: 13,
    transition: "color 0.2s",
  },
  socialSection: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  socialLink: {
    color: "#666",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s",
  },
};
