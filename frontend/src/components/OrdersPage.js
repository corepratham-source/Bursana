import { useEffect, useRef, useState } from "react";
import api from "../api";
import useAlert from "../hooks/useAlert";
import { useNavigate, useOutletContext } from "react-router-dom";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("current"); // current | past
  const [isLoading, setIsLoading] = useState(true);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [animationCycle, setAnimationCycle] = useState(0);
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const { refreshCartCount, isAuthenticated, requireLogin } = useOutletContext();
  const hasFinishedInitialLoad = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      requireLogin?.();
      navigate("/");
      return;
    }

    fetchOrders();
  }, [isAuthenticated, navigate, requireLogin]);

  const fetchOrders = async () => {
    const loadStart = Date.now();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/orders/customer-orders", {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      setOrders(res.data);
      if (res.data.length === 0) {
        showAlert("No orders found", "info");
      }
    } catch {
      showAlert("Failed to load orders");
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
  const addToCart = async (productid) => {
    try {
      await api.post("/cart/add", { product_id: productid });
      await refreshCartCount?.();
      showAlert("Added to cart", "success");
    } catch {
      showAlert("Failed to add to cart", "error");
    }
  };
  const filteredOrders = orders.filter(o =>
    tab === "current"
      ? ["pending", "confirmed", "shipped"].includes(o.status)
      : ["delivered", "cancelled"].includes(o.status)
  );

  useEffect(() => {
    if (isLoading) return;

    if (!hasFinishedInitialLoad.current) {
      hasFinishedInitialLoad.current = true;
      return;
    }

    setIsTabLoading(true);
    const timeout = setTimeout(() => {
      setAnimationCycle((prev) => prev + 1);
      setIsTabLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [tab, isLoading]);

  useEffect(() => {
    refreshCartCount?.();
  }, [refreshCartCount]);

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes orderShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes orderCardIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* ================= TABS ================= */}
      <div style={styles.tabs}>
        <button
          style={tab === "current" ? styles.activeTab : styles.tab}
          onClick={() => setTab("current")}
        >
          Current Orders
        </button>
        <button
          style={tab === "past" ? styles.activeTab : styles.tab}
          onClick={() => setTab("past")}
        >
          Past Orders
        </button>
      </div>

      {!isLoading && !isTabLoading && filteredOrders.length === 0 && (
        <p style={{ opacity: 0.6, textAlign: "center" }}>
          No orders found
        </p>
      )}
      <div style = {styles.orderSection}>
        {(isLoading || isTabLoading) &&
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`order-skeleton-${index}`}
              style={{
                ...styles.card,
                ...styles.skeletonCard,
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div style={{ ...styles.skeletonLine, width: "55%" }} />
              <div
                style={{
                  ...styles.skeletonLine,
                  width: "30%",
                  height: 16,
                  marginTop: 10,
                }}
              />
              <div style={{ marginTop: 16 }}>
                <div style={{ ...styles.skeletonLine, width: "100%", height: 58 }} />
                <div
                  style={{
                    ...styles.skeletonLine,
                    width: "100%",
                    height: 58,
                    marginTop: 8,
                  }}
                />
              </div>
              <div
                style={{
                  ...styles.skeletonLine,
                  width: "35%",
                  height: 18,
                  marginTop: 14,
                  marginLeft: "auto",
                }}
              />
            </div>
          ))}

        {!isLoading && !isTabLoading && filteredOrders.map((order, index) => (
          order.products?.length > 0 && (

              <div
                key={`${order.order_id}-${animationCycle}`}
                style={{
                  ...styles.card,
                  ...styles.cardEnter,
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div style={styles.header}>
                  <strong>Order #{order.order_id}</strong>
                  <span style={styles.status(order.status)}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

              <p style={{ fontSize: 13, opacity: 0.7 }}>
                {new Date(order.created_at).toLocaleString()}
              </p>

              {/* ================= PRODUCTS ================= */}
              <div style={styles.products}>
                {order.products.map((p) => (
                  <div
                    key={`${order.order_id}-${p.product_id}`}
                    style={styles.productRow}
                  >
                    <img
                      src={p.image || "/placeholder.png"}
                      alt={p.name}
                      style={styles.image}
                    />
                    <span>{p.name}</span>
                    <strong>₹{p.price} x {p.quantity}</strong>
                    <button
                      style={styles.reorderButton}
                      onClick={() => addToCart(p.product_id)}
                    >Re-Order</button>
                  </div>
                ))}
              </div>


              <div style={styles.total}>
                Total: ₹{order.total}
              </div>
            </div>   
        )))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    margin: "0 auto",
    minHeight: "100vh",
  },

  tabs: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  tab: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #000",
    background: "#fff",
    cursor: "pointer",
  },

  activeTab: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #000",
    background: "#000",
    color: "#fff",
    cursor: "pointer",
  },

  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    border: "1px solid #ddd",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    width: "40%",
    maxWidth: "100%",
    minWidth: 320,
    flex: "0 1 40%",
    boxSizing: "border-box",
  },
  cardEnter: {
    animation: "orderCardIn 520ms ease both",
  },
  skeletonCard: {
    pointerEvents: "none",
    overflow: "hidden",
    animation: "orderCardIn 520ms ease both",
  },
  skeletonLine: {
    borderRadius: 8,
    height: 24,
    background:
      "linear-gradient(90deg, #f1f1f1 0%, #ececec 35%, #f1f1f1 70%, #f1f1f1 100%)",
    backgroundSize: "220% 100%",
    animation: "orderShimmer 1.9s ease-in-out infinite",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  status: (s) => ({
    fontSize: 12,
    fontWeight: 700,
    color:
      s === "delivered"
        ? "green"
        : s === "cancelled"
        ? "red"
        : "#f57c00",
  }),

  products: {
    marginTop: 12,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },

  productRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  image: {
    width: 50,
    height: 50,
    objectFit: "cover",
    borderRadius: 6,
  },

  total: {
    marginTop: 10,
    textAlign: "right",
    fontWeight: 700,
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
    zIndex: 5000,
    background: "rgba(250, 250, 250, 0.35)",
    backdropFilter: "blur(2px)",
    WebkitBackdropFilter: "blur(20px)",
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
    transition: "transform 0.4s ease",
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
    textTransform: "uppercase",
    fontWeight: "550",
  },
  reorderButton: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #000",
    background: "#ffffff",
    cursor: "pointer",
  },
  orderSection: { 
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "stretch",
    gap: 20,
    maxWidth: 1440,
    margin: "0 auto",
    padding: "0 20px",
  },
};
