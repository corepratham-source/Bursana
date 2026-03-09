import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import useAlert from "../hooks/useAlert";
import api from "../api";
import { socket } from "../socket";

export default function CartPage() {
  const navigate = useNavigate();
  const { refreshCartCount, isAuthenticated, requireLogin } = useOutletContext();
  const { showAlert } = useAlert();
  const { showMessage } = useAlert();
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hoveringBurger, setHoveringBurger] = useState(false);
  const [cartItems, setCartItems] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
  const [animationCycle, setAnimationCycle] = useState(0);

  /* ===================== DATA ===================== */
  const fetchCart = async () => {
    const loadStart = Date.now();
    setIsLoading(true);
    try {
      const response = await api.get("/cart");
      setCartItems(response.data);
    } catch {
      showAlert("Failed to fetch cart items");
    } finally {
      const elapsed = Date.now() - loadStart;
      const minSkeletonMs = 700;
      const remaining = Math.max(0, minSkeletonMs - elapsed);
      setTimeout(() => {
        setAnimationCycle((prev) => prev + 1);
        setIsLoading(false);
      }, remaining);
    }
  };
  const placeCartOrder = async () => {
    try {
      const res = await api.post("/orders/cart");
      showAlert("Order placed successfully! Suppliers notified.", "success");
      showMessage("Please note that we have multiple suppliers. You will receive separate messages from each supplier regarding your order details and delivery timelines.", "success", 40000);
      setCartItems([]);
      navigate("/");

    } catch (err) {
      console.error(err);
      showAlert(
        err.response?.data?.error || "Failed to place order",
        "error"
      );
    }
  };

  const updateQuantity = async (productId, change) => {
    try {
      const res = await api.post("/cart/update", {
        product_id: productId,
        change,
      });
      setCartItems(res.data);
    } catch (err) {
      showAlert(err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      requireLogin?.();
      navigate("/");
      return;
    }

    setSidebarOpen(false);
    fetchCart();
    socket.on("cartUpdated", setCartItems);
    return () => socket.off("cartUpdated");
  }, [isAuthenticated, navigate, requireLogin]);

  useEffect(() => {
    refreshCartCount?.();
  }, [cartItems, refreshCartCount]);

  const total = cartItems.reduce(
    (sum, p) => sum + ((parseFloat(p.total_price)) * p.quantity || 0),
    0
  );
  const total_quantity = cartItems.reduce(
    (sum, p) => sum + (parseInt(p.quantity) || 0),
    0
  );

  /* ===================== DERIVED STYLES ===================== */
  const mainStyle = {
  ...styles.main,
  padding: isMobile ? 16 : 40,
  marginLeft: isMobile ? 0 : 170,
  flexDirection: isMobile ? "column" : "row",
  alignItems: isMobile ? "center" : "stretch",
  justifyContent: "flex-start",
  maxWidth: isMobile ? "100%" : "calc(100% - 170px)",
};

  const cartContainerStyle = isMobile
    ? styles.cartContainerMobile
    : styles.cartContainer;

  const summaryCardStyle = {
    ...styles.summaryCard,
    width: isMobile ? "95%" : "auto",
    maxWidth: isMobile ? 420 : "none",
    height: isMobile ? "auto" : 300,
  };

  const cartItemStyle = {
    ...styles.cartItemCard,
    flexDirection: isMobile ? "column" : "row",
    textAlign: isMobile ? "center" : "left",
    width: "100%",
    boxSizing: "border-box",
    minHeight: isMobile ? "auto" : 190,
  };

  const imageWrapperStyle = {
    width: isMobile ? "100%" : 160,
    display: "flex",
    justifyContent: "center",
    flexShrink: 0,
  };

  const qtyBoxStyle = {
    ...styles.qtyBox,
    paddingTop: isMobile ? 0 : 30,
  };

  /* ===================== RENDER ===================== */
  return (
    <div style={styles.page}>
      <style>{`
        @keyframes cartShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes cartCardIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* ================= SIDEBAR ================= */}
      <div
          style={{
            ...styles.sidebar,
            width: sidebarOpen ? 170 : 48,
            background:
              !sidebarOpen
                ? "transparent"
                : "rgba(250, 250, 250, 0.35)",
            backdropFilter:
              !sidebarOpen ? "none" : "blur(2px)",
          }}
        >
        <button
          onClick={() => setSidebarOpen((p) => !p)}
          onMouseEnter={() => setHoveringBurger(true)}
          onMouseLeave={() => setHoveringBurger(false)}
          style={{
            ...styles.burgerBtn,
            transform: hoveringBurger ? "scale(1.08)" : "scale(1)",
          }}
        >
          <span
            style={{
              ...styles.bar,
              backgroundColor: sidebarOpen ? "#d32f2f" : "#000",
              transform: sidebarOpen
                ? "rotate(45deg) translate(3px, 3px)"
                : "rotate(0)",
            }}
          />
          <span
            style={{
              ...styles.bar,
              backgroundColor: sidebarOpen ? "#d32f2f" : "#000",
              opacity: sidebarOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              ...styles.bar,
              backgroundColor: sidebarOpen ? "#d32f2f" : "#000",
              transform: sidebarOpen
                ? "rotate(-45deg) translate(3px, -3px)"
                : "rotate(0)",
            }}
          />
        </button>

        {sidebarOpen && (
          <>
            <button
              style={styles.sidebarButton}
              onClick={() => navigate("/cart")}
            >
              Cart
            </button>
            <button
              style={styles.sidebarButton}
              onClick={() => navigate("/orders")}
            >
              Orders
            </button>
          </>
        )}
      </div>

      {/* ================= MAIN ================= */}
      <div style={mainStyle}>
        {/* CART */}
        <div style={cartContainerStyle}>
          <h2 style={{ marginBottom: 10 }}>Your Cart</h2>

          <div style={styles.cartScrollArea}>
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`cart-skeleton-${index}`}
                  style={{
                    ...cartItemStyle,
                    ...styles.skeletonCard,
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div style={{ ...imageWrapperStyle, ...styles.skeletonImageWrap }}>
                    <div style={styles.skeletonFill} />
                  </div>

                  <div style={{ flex: 1, width: "100%" }}>
                    <div style={{ ...styles.skeletonLine, width: "60%" }} />
                    <div
                      style={{
                        ...styles.skeletonLine,
                        width: "92%",
                        height: 16,
                        marginTop: 10,
                      }}
                    />
                    <div
                      style={{
                        ...styles.skeletonLine,
                        width: "85%",
                        height: 16,
                        marginTop: 8,
                      }}
                    />
                  </div>

                  <div style={{ ...qtyBoxStyle, width: 110 }}>
                    <div style={{ ...styles.skeletonLine, width: "100%", height: 38 }} />
                    <div
                      style={{
                        ...styles.skeletonLine,
                        width: "80%",
                        height: 16,
                        marginTop: 10,
                        marginLeft: "auto",
                        marginRight: "auto",
                      }}
                    />
                  </div>
                </div>
              ))}

            {!isLoading && cartItems.length === 0 && (
              <div style={{
                ...styles.cartItemCard,
                justifyContent:"center"
                }}>
                <p style={{ fontSize: 20, fontWeight: "bold" }}>
                  Your cart is empty.
                </p>
              </div>
            )}

            {!isLoading && cartItems.map((p, index) => (
              <div
                key={`${p.id}-${animationCycle}`}
                style={{
                  ...cartItemStyle,
                  ...styles.itemEnter,
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div style={imageWrapperStyle}>
                  <img
                    src={p.images[0] || "/placeholder.png"}
                    style={styles.cartImg}
                    alt="product"
                  />
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: isMobile ? "flex-start" : "center",
                    height:"100%"
                  }}
                >
                  <h3 style={{ marginBottom: 2 }}>
                    {p.name || "Product"}
                  </h3>

                  {!isMobile && (
                    <p
                      style={{
                        maxWidth: 420,
                        maxHeight:90,
                        whiteSpace: "pre-line",
                        color: "#444",
                        overflowY:"auto"
                      }}
                    >
                      {p.description || "No description"}
                    </p>
                  )}
                </div>

                <div style={qtyBoxStyle}>
                  <div style={styles.qtyControls}>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => updateQuantity(p.id, -1)}
                    >
                      -
                    </button>
                    <span>{p.quantity}</span>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => updateQuantity(p.id, +1)}
                    >
                      +
                    </button>
                  </div>

                  <p style={{ marginTop: 10 }}>
                    <strong>
                      Total: ₹ {((parseFloat(p.total_price)) * parseInt(p.quantity)).toFixed(2)}
                    </strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUMMARY */}
        <div style={summaryCardStyle}>
          <h3>Order Summary</h3>
          <div style={{ marginTop: 10 }}>
            <p>Total Items: {total_quantity}</p>
            <p>
              <strong>Total: ₹ {(1.18*total).toFixed(2)}</strong>
            </p>
            <p>
              (Including GST and other taxes as applicable)
            </p>
          </div>
          <button style={styles.placeOrderBtn}
          onClick={placeCartOrder}>Place Order</button>
        </div>
      </div>
    </div>
  );
}

/* ===================== STYLES ===================== */
const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    overflowX: "hidden",
  },

  sidebar: {
    position: "fixed",
    top: 74,
    height: "calc(100vh - 74px)",
    overflowY: "auto",
    transition: "0.25s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 40,
    zIndex: 1001,
  },

  burgerBtn: {
    width: 20,
    height: 14,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 0,
    marginTop: 15,
  },

  bar: {
    width: "100%",
    height: 2,
    borderRadius: 2,
    transition: "all 0.3s",
  },

  sidebarButton: {
    width: "80%",
    marginTop: 14,
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #000",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    textTransform: "uppercase",
  },

  main: {
    flex: 1,
    display: "flex",
    gap: 30,
  },

  cartContainer: {
    flex: 2,
    maxWidth: "65%",
    background: "rgba(255,255,255,0.4)",
    borderRadius: 14,
    border: "1px solid #ddd",
    padding: 20,
    boxShadow: "0px 10px 25px rgba(0,0,0,0.25)",
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
  },

  cartContainerMobile: {
    background: "rgba(255,255,255,0.4)",
    borderRadius: 14,
    border: "1px solid #ddd",
    padding: 12,
    boxShadow: "0px 10px 25px rgba(0,0,0,0.25)",
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
  },

  cartScrollArea: {
    overflowY: "auto",
  },

  cartItemCard: {
    background: "#fff",
    borderRadius: 10,
    border: "1px solid #ddd",
    padding: 16,
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 24,
  },
  itemEnter: {
    animation: "cartCardIn 520ms ease both",
  },
  skeletonCard: {
    pointerEvents: "none",
    overflow: "hidden",
    animation: "cartCardIn 520ms ease both",
  },
  skeletonImageWrap: {
    borderRadius: 8,
    overflow: "hidden",
    height: 120,
  },
  skeletonFill: {
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(90deg, #f1f1f1 0%, #ececec 35%, #f1f1f1 70%, #f1f1f1 100%)",
    backgroundSize: "220% 100%",
    animation: "cartShimmer 1.9s ease-in-out infinite",
  },
  skeletonLine: {
    borderRadius: 8,
    height: 24,
    background:
      "linear-gradient(90deg, #f1f1f1 0%, #ececec 35%, #f1f1f1 70%, #f1f1f1 100%)",
    backgroundSize: "220% 100%",
    animation: "cartShimmer 1.9s ease-in-out infinite",
  },

  summaryCard: {
    flex: 1,
    minWidth: 300,
    maxWidth: 360,
    background: "rgba(255,255,255,0.4)",
    borderRadius: 14,
    border: "1px solid #ddd",
    padding: 20,
    boxShadow: "0px 10px 25px rgba(0,0,0,0.25)",
  },

  placeOrderBtn: {
    marginTop: 20,
    width: "100%",
    padding: 12,
    border: "none",
    borderRadius: 8,
    background: "#000",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  cartImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 6,
  },

  qtyBox: {
    width: 130,
    textAlign: "center",
  },

  qtyControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #aaa",
    borderRadius: 18,
    padding: "6px 10px",
  },

  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "1px solid #aaa",
    background: "#fff",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 700,
  },
};
