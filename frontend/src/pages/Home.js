import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

import CustomerBanner from "../components/CustomerBanner";
import CustomerFooter from "../components/CustomerFooter";

import Storefront from "../components/Storefront";
import CategoriesPage from "../components/CategoriesPage";
import BestSellersPage from "../components/BestSellersPage";
import CartPage from "../components/CartPage";
import WishlistPage from "../components/WishlistPage";
import CustomerOrders from "../components/OrdersPage";
import ProductPage from "../components/ProductPage";
import CODAvailable from "../components/CODAvailable";

import LoginPage from "../components/LoginPage";
import RegistrationPage from "../components/RegistrationPage";

import SupplierLoginPage from "../components/SupplierLoginPage";
import SupplierLayout from "../components/SupplierLayout";
import ProductIngestion from "../components/ProductIngestion";
import ProductManagePage from "../components/ProductManagePage";
import CODIngestionPage from "../components/CODProductIngestion";

import TermsAndConditionsPage from "../components/TermsAndConditionsPage";
import RefundPolicyPage from "../components/RefundPolicyPage";
import ShippingPolicyPage from "../components/ShippingPolicyPage";
import PrivacyPolicyPage from "../components/PrivacyPolicyPage";
import SearchResultsPage from "./SearchResultsPage";

import api from "../api";

function MainLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);

  const isAuthenticated = Boolean(user);

  // Refresh cart and wishlist counts
  const refreshCounts = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }
    try {
      const response = await api.get("/cart");
      const items = Array.isArray(response.data) ? response.data : [];
      setCartCount(items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0));
    } catch {}
    try {
      const wishlistRes = await api.get("/wishlist");
      setWishlistCount(Array.isArray(wishlistRes.data) ? wishlistRes.data.length : 0);
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  // Logout
  const handleLogout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    }
    localStorage.removeItem("user");
    localStorage.removeItem("mode");
    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
    navigate("/");
  }, [navigate, setUser]);

  // Handle popup close and refresh after login
  const handleCloseLogin = () => {
    setShowLoginPopup(false);
  };

  const handleCloseRegister = () => {
    setShowRegisterPopup(false);
  };

  const handleOpenRegister = () => {
    setShowLoginPopup(false);
    setShowRegisterPopup(true);
  };

  // Context for child routes
  const routeContext = {
    refreshCartCount: refreshCounts,
    isAuthenticated,
    requireLogin: () => setShowLoginPopup(true),
    handleUnauthorized: () => setShowLoginPopup(true),
    user,
  };

  return (
    <>
      <CustomerBanner
        bannerLogoUrl="https://res.cloudinary.com/dwnzd0c2t/image/upload/v1769081838/bursana_icon-removebg_chkjc9.png"
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onCartClick={() => navigate("/cart")}
        onLogout={handleLogout}
        onShowLogin={() => setShowLoginPopup(true)}
        user={user}
      />

      <main style={{ paddingTop: "80px", flex: 1, minHeight: "calc(100vh - 150px)" }}>
        <Outlet context={routeContext} />
      </main>

      <CustomerFooter />

      {/* Login Popup */}
      {showLoginPopup && (
        <LoginPage
          role="customer"
          asModal={true}
          onClose={handleCloseLogin}
          goToRegister={handleOpenRegister}
        />
      )}

      {/* Register Popup */}
      {showRegisterPopup && (
        <RegistrationPage
          role="customer"
          asModal={true}
          onClose={handleCloseRegister}
        />
      )}
    </>
  );
}

export default function Home() {
  return (
    <Router>
      <Routes>
        {/* Supplier Routes */}
        <Route path="/supplier" element={<SupplierLoginPage />} />
        <Route path="/supplier/ingest" element={<SupplierLayout><ProductIngestion /></SupplierLayout>} />
        <Route path="/supplier/manage" element={<SupplierLayout><ProductManagePage /></SupplierLayout>} />
        <Route path="/supplier/ingest/cod" element={<SupplierLayout><CODIngestionPage /></SupplierLayout>} />

        {/* Customer Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Storefront />}/>
          <Route path="product/:category/:id" element={<ProductPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="best-sellers" element={<BestSellersPage />} />
          <Route path="cod" element={<CODAvailable />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="terms-and-conditions" element={<TermsAndConditionsPage />} />
          <Route path="refund-policy" element={<RefundPolicyPage />} />
          <Route path="shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="search" element={<SearchResultsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
