import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../api";
import ProductCard from "./ProductCard";

export default function CategoriesPage() {
  const context = useOutletContext() || {};
  const {
    refreshCartCount,
    isAuthenticated,
    requireLogin = () => {},
  } = context;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products"),
          api.get("/products/categories"),
        ]);

        setProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);

        if (categoriesRes.data?.length > 0) {
          setSelectedCategory(categoriesRes.data[0]);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 900);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/wishlist", {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });

        if (Array.isArray(res.data)) {
          setWishlistItems(res.data.map((i) => Number(i.product_id)));
        }
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

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
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlistItems((prev) => prev.filter((id) => id !== Number(productId)));
      } else {
        await api.post(
          "/wishlist/add",
          { product_id: Number(productId) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistItems((prev) => [...prev, Number(productId)]);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  return (
    <div style={{ padding: "80px 20px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <style>{`
        @keyframes storefrontShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes storefrontCardIn {
          0% { opacity: 0; transform: translateY(12px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 24, textAlign: "center" }}>
        Categories
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: "10px 20px",
              borderRadius: 30,
              border: "none",
              background:
                selectedCategory === category
                  ? "linear-gradient(to right, #6A8DFF, #9D7BFF)"
                  : "#f5f5f5",
              color: selectedCategory === category ? "#fff" : "#555",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: 24,
      }}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                style={{
                  ...styles.card,
                  ...styles.skeletonCard,
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div style={{ ...styles.imageFrame, ...styles.skeletonBlock }}>
                  <div style={styles.skeletonFill} />
                </div>
                <div style={styles.cardContent}>
                  <div style={{ ...styles.skeletonLine, width: "86%", height: 18 }} />
                  <div style={{ ...styles.skeletonLine, width: "45%", height: 14, marginTop: 10 }} />
                  <div style={{ ...styles.skeletonLine, width: "100%", height: 36, marginTop: 24, borderRadius: 20 }} />
                </div>
              </div>
            ))
          : filteredProducts.map((product) => (
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
            ))}
      </div>

      {!isLoading && filteredProducts.length === 0 && (
        <p style={{ textAlign: "center", color: "#888", marginTop: 40 }}>
          No products found in this category.
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
    cursor: "pointer",
  },
  skeletonCard: {
    pointerEvents: "none",
    animation: "storefrontCardIn 560ms ease both",
  },
  skeletonBlock: {
    position: "relative",
    background: "#f1f1f1",
    aspectRatio: "3 / 4",
  },
  skeletonFill: {
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, #f1f1f1 0%, #ececec 35%, #f1f1f1 70%, #f1f1f1 100%)",
    backgroundSize: "220% 100%",
    animation: "storefrontShimmer 3s ease-in-out infinite",
  },
  skeletonLine: {
    borderRadius: 8,
    background: "linear-gradient(90deg, #f1f1f1 0%, #ececec 35%, #f1f1f1 70%, #f1f1f1 100%)",
    backgroundSize: "220% 100%",
    animation: "storefrontShimmer 3s ease-in-out infinite",
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
  },
  cardContent: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: 500,
    color: "#222",
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  price: {
    fontWeight: 600,
  },
  addButton: {
    padding: "8px 16px",
    borderRadius: 20,
    background: "linear-gradient(to right, #6A8DFF, #9D7BFF)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};