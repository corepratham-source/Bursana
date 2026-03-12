import { useEffect, useState } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
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
    const searchProducts = async () => {
      if (!query.trim()) {
        setProducts([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
        setProducts(response.data || []);
      } catch (err) {
        console.error("Search failed:", err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    searchProducts();
  }, [query]);

  // Fetch wishlist
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }
    const fetchWishlist = async () => {
      try {
        const res = await api.get("/wishlist");
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
        Search Results
      </h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "32px" }}>
        {query ? `Showing results for "${query}"` : "Enter a search term to find products"}
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
                styles={{}}
                addToCart={() => addToCart(product.id)}
                isInWishlist={wishlistItems.includes(product.id)}
                onToggleWishlist={(e) => handleToggleWishlist(product.id, e)}
              />
            ))
        }
      </div>

      {!isLoading && products.length === 0 && query && (
        <p style={{ textAlign: "center", color: "#888", marginTop: "40px" }}>
          No products found matching "{query}"
        </p>
      )}
    </div>
  );
}
