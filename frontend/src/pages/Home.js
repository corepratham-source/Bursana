import { useCallback, useEffect, useState } from "react";
import {
  Routes,
  Route,
  Outlet,
  useNavigate,
} from "react-router-dom";
import CartPage from "../components/CartPage";
import WishlistPage from "../components/WishlistPage";
import LandingPage from "../components/LandingPage";
import Storefront from "../components/Storefront";
import CustomerOrders from "../components/OrdersPage";
import CustomerBanner from "../components/CustomerBanner";
import CustomerFooter from "../components/CustomerFooter";
import LoginPage from "../components/LoginPage";
import RegistrationPage from "../components/RegistrationPage";
import TermsAndConditionsPage from "../components/TermsAndConditionsPage";
import RefundPolicyPage from "../components/RefundPolicyPage";
import ShippingPolicyPage from "../components/ShippingPolicyPage";
import PrivacyPolicyPage from "../components/PrivacyPolicyPage";
import useAlert from "../hooks/useAlert";
import api from "../api";
import "../grid.css";

export default function Home() {
  const bannerLogoUrl = "https://res.cloudinary.com/dwnzd0c2t/image/upload/v1769081838/bursana_icon-removebg_chkjc9.png";
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  return (
    <div>
      <div style={{ textAlign: "center" }}>
        <Routes>
          {/* Customer Routes */}
          <Route
            element={
              <CustomerLayout
                bannerLogoUrl={bannerLogoUrl}
                user={user}
                onLogin={setUser}
              />
            }
          >
            <Route path="/" element={<Storefront userId={user?.id} />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/orders" element={<CustomerOrders />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/landing" element={<LandingPage onLogin={setUser} />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

function CustomerLayout({ bannerLogoUrl, user, onLogin }) {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");

  const isAuthenticated = Boolean(user);
  const { showAlert } = useAlert();

  /* ---------- LOGIN POPUP FUNCTIONS ---------- */

  const openLoginPopup = useCallback(() => {
    setAuthModalMode("login");
    setShowLoginPopup(true);
  }, []);

  const closeLoginPopup = useCallback(() => {
    setShowLoginPopup(false);
  }, []);

  /* ---------- LISTEN FOR LOGIN TRIGGER ---------- */

  useEffect(() => {
    const handleTriggerLogin = () => {
      openLoginPopup();
    };

    window.addEventListener("triggerLoginModal", handleTriggerLogin);

    return () =>
      window.removeEventListener("triggerLoginModal", handleTriggerLogin);
  }, [openLoginPopup]);

  /* ---------- AUTH ---------- */

  const clearAuthState = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("mode");
    onLogin(null);
    setCartCount(0);
  }, [onLogin]);

  const handleLogout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
      showAlert("Logout successful!", "success");
    } catch (err) {
      console.error("Logout failed:", err);
    }

    clearAuthState();
    navigate("/");
  }, [clearAuthState, navigate, showAlert]);

  const handleLogin = useCallback(
    (loggedInUser) => {
      onLogin(loggedInUser);
      setShowLoginPopup(false);
    },
    [onLogin]
  );

  /* ---------- CART COUNT ---------- */

  const refreshCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    try {
      const response = await api.get("/cart");

      const items = Array.isArray(response.data) ? response.data : [];

      const totalItems = items.reduce(
        (sum, item) => sum + (parseInt(item.quantity, 10) || 0),
        0
      );

      setCartCount(totalItems);
    } catch { }

    try {
      const wishlistRes = await api.get("/wishlist");

      const wishlistItems = Array.isArray(wishlistRes.data)
        ? wishlistRes.data
        : [];

      setWishlistCount(wishlistItems.length);
    } catch { }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  /* ---------- UI ---------- */

  return (
    <div style={styles.customerShell}>
      <CustomerBanner
        bannerLogoUrl={bannerLogoUrl}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onCartClick={() => navigate("/cart")}
        onLogout={handleLogout}
        onShowLogin={openLoginPopup}
        user={user}
      />

      <main style={styles.customerMain}>
        <Outlet
          context={{
            refreshCartCount,
            isAuthenticated,
            requireLogin: openLoginPopup,
            handleUnauthorized: openLoginPopup,
          }}
        />
      </main>

      <CustomerFooter />

      {showLoginPopup && (
        <>
          {authModalMode === "login" ? (
            <LoginPage
              onLogin={handleLogin}
              goToRegister={() => setAuthModalMode("register")}
              asModal
              onClose={closeLoginPopup}
            />
          ) : (
            <RegistrationPage
              goToLogin={() => setAuthModalMode("login")}
              goToOnboarding={() => navigate("/landing")}
              asModal
              onClose={closeLoginPopup}
            />
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  customerShell: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  customerMain: {
    paddingTop: 0,
    flex: 1,
  },
  noticeContainer: {
    margin: "0 auto",
    textAlign: "center",
    background: "#f7f7f6",
    border: "1px solid rgb(0, 0, 0)",
    borderRadius: 0,
    padding: "8px clamp(18px, 4vw, 38px)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    maxWidth: "1200px",
    marginTop: "70px",
    marginBottom: "20px",
    position: "relative",
    zIndex: 10,
  },
  noticeTitle: {
    margin: 0,
    textAlign: "center",
    fontFamily: "Georgia, serif",
    fontWeight: 700,
    fontSize: "clamp(26px, 3.4vw, 44px)",
    lineHeight: 1.2,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    background: "linear-gradient(90deg, #ff0033, #ff7a00, #ffd400, #2dff5f, #12d8ff, #7c4dff, #ff2ec7)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "rainbow 2.4s linear infinite",
  },
  noticeText: {
    margin: 0,
    textAlign: "center",
    fontFamily: "Georgia, serif",
    fontWeight: 400,
    fontSize: "clamp(14px, 2vw, 20px)",
    lineHeight: 1.4,
    color: "#333",
  },
};
