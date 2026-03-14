import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../api";
import ProductCard from "./ProductCard";

export default function BestSellersPage() {
  // Get context - may be null if not available
  const context = useOutletContext() || {};
  
  const {
    refreshCartCount,
    isAuthenticated,
    requireLogin = () => {},
  } = context;
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await api.get("/products");
        setProducts(productsRes.data || []);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 900);
      }
    };
    fetchData();
  }, []);

  // Fetch wishlist
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/wishlist", {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        if (Array.isArray(res.data)) {
          setWishlistItems(res.data.map(item => Number(item.product_id)));
        }
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      }
    };
    fetchWishlist();
  }, [isAuthenticated]);

  const addToCart = async (productId) => {
    if (!isAuthenticated) {
      requireLogin();
      return;
    }
    try {
      await api.post("/cart/add", { product_id: productId });
      await refreshCartCount?.();
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const handleToggleWishlist = async (productId, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      requireLogin();
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const isInWishlist = wishlistItems.includes(Number(productId));
      if (isInWishlist) {
        await api.delete(`/wishlist/remove/${Number(productId)}`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        setWishlistItems(prev => prev.filter(id => id !== Number(productId)));
      } else {
        await api.post("/wishlist/add", { product_id: Number(productId) }, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        setWishlistItems(prev => [...prev, Number(productId)]);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  return (
    <div style={{ padding: "80px 20px 40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "600", marginBottom: "8px", textAlign: "center" }}>
        Best Sellers
      </h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "32px" }}>
        Our most popular products chosen by customers
      </p>
      
      {/* Products Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "24px" }}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: "300px", background: "#f0f0f0", borderRadius: "12px", animation: "pulse 1.5s infinite" }} />
            ))
          : products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cardImage={Array.isArray(product.images) ? product.images[0] : product.images}
                index={0}
                styles={styles}
                addToCart={() => addToCart(product.id)}
                isInWishlist={wishlistItems.includes(product.id)}
                onToggleWishlist={(e) => handleToggleWishlist(product.id, e)}
              />
            ))
        }
      </div>

      {!isLoading && products.length === 0 && (
        <p style={{ textAlign: "center", color: "#888", marginTop: "40px" }}>
          No products available.
        </p>
      )}
    </div>
  );
}
const styles = {
  card: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  },
  cardEnter: {
    animation: "storefrontCardIn 560ms ease both",
  },
  cardOpening: {
    animation: "storefrontCardClickOpen 180ms ease forwards",
    transformOrigin: "center center",
  },
productName: {
    margin: 0,
    fontSize: 14,
    fontWeight: 500,
    color: "#222",
    lineHeight: 1.3,
    minHeight: "2.6em",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  price: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: "#1a1a1a",
  },
  addButton: {
    padding: "8px 16px",
    background: "linear-gradient(to right, #6A8DFF, #9D7BFF)",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
imageFrame: {
    width: "100%",
    aspectRatio: "3 / 4",
    background: "#f5f5f5",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    cursor: "pointer",
    transition: "transform 0.3s",
  },
  cardContent: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
}