import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../api";
import ProductCard from "./ProductCard";

export default function CategoriesPage() {
  // Get context - may be null if not available
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
        
        // Auto-select first category
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

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((product) => product.category === selectedCategory);
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
      <h1 style={{ fontSize: "32px", fontWeight: "600", marginBottom: "24px", textAlign: "center" }}>
        Categories
      </h1>
      
      {/* Category Tabs */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "32px" }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: selectedCategory === category ? "linear-gradient(to right, #6A8DFF, #9D7BFF)" : "#f5f5f5",
              color: selectedCategory === category ? "#fff" : "#555",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "24px" }}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: "300px", background: "#f0f0f0", borderRadius: "12px", animation: "pulse 1.5s infinite" }} />
            ))
          : filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cardImage={Array.isArray(product.images) ? product.images[0] : product.images}
                index={0}
                styles={{}}
                addToCart={() => addToCart(product.id)}
                isInWishlist={wishlistItems.includes(product.id)}
                onToggleWishlist={(e) => handleToggleWishlist(product.id, e)}
              />
            ))
        }
      </div>

      {!isLoading && filteredProducts.length === 0 && (
        <p style={{ textAlign: "center", color: "#888", marginTop: "40px" }}>
          No products found in this category.
        </p>
      )}
    </div>
  );
}
