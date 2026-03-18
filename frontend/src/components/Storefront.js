import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../api";
import { socket } from "../socket";
import useAlert from "../hooks/useAlert";
import HeroSection from "./HeroSection";
import CategoryCard from "./CategoryCard";
import ProductCard from "./ProductCard";

export default function Storefront(props) {
  const { showAlert } = useAlert();
  // Get context - may be null if not available
  const context = useOutletContext() || {};
  
  const {
    refreshCartCount,
    isAuthenticated,
    requireLogin = () => {},
    handleUnauthorized = () => {},
  } = context;

  // If props are passed directly, use those instead
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [animationCycle, setAnimationCycle] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const hasFinishedInitialLoad = useRef(false);

  const [showCarousel, setShowCarousel] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [carouselImages, setCarouselImages] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [hoveredImageIndexes, setHoveredImageIndexes] = useState({});
  const [openingProductId, setOpeningProductId] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const hoverIntervalsRef = useRef({});
  const openCarouselTimeoutRef = useRef(null);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
  if (showCarousel) {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  } else {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }

  return () => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  };
}, [showCarousel]);

  useEffect(() => {
    const fetchData = async () => {
      const loadStart = Date.now();
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products"),
          api.get("/products/categories"),
        ]);

        setProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch {
        showAlert("Failed to load storefront data", "error");
      } finally {
        const elapsed = Date.now() - loadStart;
        const minSkeletonMs = 900;
        const remaining = Math.max(0, minSkeletonMs - elapsed);
        setTimeout(() => setIsLoading(false), remaining);
      }
    };

    fetchData();

    socket.on("newProduct", (product) => {
      setProducts((prev) => [product, ...prev]);
    });

    return () => socket.off("newProduct");
  }, [showAlert]);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshCartCount?.();
  }, [isAuthenticated, refreshCartCount]);

  // Fetch wishlist items
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
          setWishlistItems(res.data.map(item => Number(item.product_id)));
        }
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  // Toggle wishlist function - add/remove from wishlist
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
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        setWishlistItems(prev => prev.filter(id => id !== Number(productId)));
        showAlert("Removed from wishlist", "success");
      } else {
        await api.post("/wishlist/add", { product_id: Number(productId) }, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        setWishlistItems(prev => [...prev, Number(productId)]);
        showAlert("Added to wishlist!", "success");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        requireLogin();
      } else {
        showAlert("Failed to update wishlist: " + (error.response?.data?.error || error.message), "error");
      }
    }
  };

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "ALL") return products;
    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  useEffect(() => {
    if (isLoading) return;

    if (!hasFinishedInitialLoad.current) {
      hasFinishedInitialLoad.current = true;
      return;
    }

    setIsCategoryLoading(true);
    setAnimationCycle((prev) => prev + 1);

    const timeout = setTimeout(() => {
      setIsCategoryLoading(false);
    }, 520);

    return () => clearTimeout(timeout);
  }, [selectedCategory, isLoading]);

  const addToCart = async (productId) => {
    if (!isAuthenticated) {
      requireLogin?.();
      return;
    }

    try {
      await api.post("/cart/add", { product_id: productId });
      await refreshCartCount?.();
      showAlert("Added to cart", "success");
    } catch (err) {
      if (err?.response?.status === 401) {
        handleUnauthorized?.();
        return;
      }
      showAlert("Failed to add to cart", "error");
    }
  };

  const openCarousel = (product) => {
    const images = Array.isArray(product.images) ? product.images : [];
    if (!images.length) return;

    const productId = String(product.id);
    setOpeningProductId(productId);

    if (openCarouselTimeoutRef.current) {
      clearTimeout(openCarouselTimeoutRef.current);
    }

    openCarouselTimeoutRef.current = setTimeout(() => {
      setSelectedProduct(product);
      setCarouselImages(images);
      setCarouselIndex(0);
      setShowCarousel(true);
      setOpeningProductId(null);
      openCarouselTimeoutRef.current = null;
    }, 180);
  };

  const nextImage = () =>
    setCarouselIndex((prev) => (prev + 1) % carouselImages.length);

  const prevImage = () =>
    setCarouselIndex((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );

  const startCardImageScroll = (product) => {
    const productImages = Array.isArray(product.images) ? product.images : [];
    if (productImages.length <= 1) return;

    const productId = String(product.id);
    if (hoverIntervalsRef.current[productId]) return;

    hoverIntervalsRef.current[productId] = setInterval(() => {
      setHoveredImageIndexes((prev) => ({
        ...prev,
        [productId]: ((prev[productId] ?? 0) + 1) % productImages.length,
      }));
    }, 1000);
  };

  const stopCardImageScroll = (productId) => {
    const productIdKey = String(productId);
    const interval = hoverIntervalsRef.current[productIdKey];
    if (interval) {
      clearInterval(interval);
      delete hoverIntervalsRef.current[productIdKey];
    }

    setHoveredImageIndexes((prev) => {
      if (prev[productIdKey] == null) return prev;
      return { ...prev, [productIdKey]: 0 };
    });
  };

  useEffect(() => {
    return () => {
      Object.values(hoverIntervalsRef.current).forEach((intervalId) => {
        clearInterval(intervalId);
      });
      if (openCarouselTimeoutRef.current) {
        clearTimeout(openCarouselTimeoutRef.current);
      }
    };
  }, []);

  // Build category cards dynamically from products
  const categoryCards = useMemo(() => {
    if (categories.length === 0) return [];
    
    return categories.slice(0, 3).map((cat) => {
      // Find first product in this category to get image
      const productInCategory = products.find(p => (p.category || '').toLowerCase() === cat.toLowerCase());
      let image = "/icons/1.jpeg";
      
      if (productInCategory?.images) {
        if (Array.isArray(productInCategory.images) && productInCategory.images.length > 0) {
          image = productInCategory.images[0];
        } else if (typeof productInCategory.images === 'string') {
          image = productInCategory.images;
        }
      }
      
      return {
        name: cat,
        image: image,
        description: `Shop our collection of ${cat.toLowerCase()}`,
        button: `Shop ${cat}`,
      };
    });
  }, [categories, products]);

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes storefrontShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes storefrontCardIn {
          0% { opacity: 0; transform: translateY(12px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes storefrontCardClickOpen {
          0% { transform: scale(1); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          100% { transform: scale(1.06); box-shadow: 0 16px 32px rgba(0,0,0,0.18); }
        }
        @keyframes storefrontOverlayIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes storefrontExpandedCardIn {
          0% { opacity: 0; transform: translateY(16px) scale(0.94); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .carouselThumbScroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .carouselThumbScroll::-webkit-scrollbar {
          display: none;
        }
        /* Responsive Styles */
        @media (max-width: 768px) {
          .hero-section {
            height: 350px !important;
          }
          .hero-title {
            font-size: 28px !important;
          }
          .search-bar {
            width: 90% !important;
          }
          .category-grid {
            grid-template-columns: 1fr !important;
          }
          .category-card {
            flex-direction: column !important;
            text-align: center !important;
          }
          .category-image-wrap {
            width: 100% !important;
            height: 150px !important;
          }
          .product-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>

      <main style={styles.main}>
        {/* Notice Banner - Remove this section after completion of site */}
        <div style={{
          background: "rgba(255, 255, 255, 0.9)",
          border: "2px solid #667eea",
          borderRadius: "12px",
          padding: "20px",
          margin: "10px 20px",
          textAlign: "center",
        }}>
          <h1 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "bold", color: "#e74c3c" }}>TAKING ORDERS SOON!</h1>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "normal", color: "#e67e22" }}>JUST FOR VIEWING PLEASURE!</h2>
          <h3 style={{ margin: 0, fontSize: "14px", color: "#34495e" }}>HOWEVER PLEASE FEEL FREE TO CREATE AN ACCOUNT AND ADD ITEMS TO YOUR CART!</h3>
          <h3 style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#2c3e50" }}>WE SHALL NOTIFY YOU WHEN OUR SITE IS LIVE!</h3>
        </div>
        {/* end section for deletion */}

        {/* Hero Banner Section */}
        <HeroSection />

        {/* Category Cards Section */}
        {categoryCards.length > 0 && (
        <section style={styles.categorySection} id="categories">
          <div style={styles.categoryGrid} className="category-grid">
            {categoryCards.map((cat) => (
              <CategoryCard
                key={cat.name}
                title={cat.name}
                description={cat.description}
                image={cat.image}
                buttonLabel={cat.button}
                setSelectedCategory={setSelectedCategory}
                styles={styles}
              />
            ))}
          </div>
        </section>
        )}

        {/* Products Section */}
        <section style={styles.productsSection} id="bestsellers">
          <h2 style={styles.sectionTitle}>Our Collection</h2>
          
          {/* Category Tabs */}
          <div style={styles.tabs}>
            <button
              onClick={() => setSelectedCategory("ALL")}
              style={{
                ...tabStyle(selectedCategory === "ALL"),
                backgroundColor: selectedCategory === "ALL" ? "linear-gradient(to right, #6A8DFF, #9D7BFF)" : "transparent",
                color: selectedCategory === "ALL" ? "#fff" : "#555",
              }}
            >
              <span style={{ fontWeight: 500 }}>All</span>
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  ...tabStyle(selectedCategory === category),
                  backgroundColor: selectedCategory === category ? "linear-gradient(to right, #6A8DFF, #9D7BFF)" : "transparent",
                  color: selectedCategory === category ? "#fff" : "#555",
                }}
              >
                <span style={{ fontWeight: 500 }}>{category}</span>
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div style={styles.grid} className="product-grid">
            {isLoading || isCategoryLoading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <article
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
                    <div style={{ ...styles.skeletonLine, width: "86%", marginTop: 14 }} />
                    <div style={{ ...styles.skeletonLine, width: "45%", marginTop: 10 }} />
                    <div style={{ ...styles.skeletonLine, width: "100%", height: 44, marginTop: "auto" }} />
                  </article>
                ))
              : filteredProducts.map((product, index) => {
                  const productImages = Array.isArray(product.images) ? product.images : [];
                  const imageIndex = hoveredImageIndexes[String(product.id)] ?? 0;
                  const cardImage = productImages[imageIndex];

                  return (
                    <ProductCard
                      key={`${product.id}-${animationCycle}`}
                      product={product}
                      cardImage={cardImage}
                      index={index}
                      isOpening={openingProductId === String(product.id)}
                      styles={styles}
                      addToCart={addToCart}
                      openCarousel={openCarousel}
                      startCardImageScroll={startCardImageScroll}
                      stopCardImageScroll={stopCardImageScroll}
                      hoveredImageIndex={imageIndex}
                      isInWishlist={wishlistItems.includes(product.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  );
                })}
          </div>
        </section>
      </main>

      {/* Product Detail Modal */}
      {showCarousel && (
        <div style={styles.overlay} onClick={() => setShowCarousel(false)}>
          <div
            style={isMobile ? styles.expandedCardMobile : styles.expandedCard}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowCarousel(false)}
              style={styles.carouselCloseBtn}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" style={isMobile ? styles.carouselCloseIconMobile : styles.carouselCloseIcon}>
                <path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div style={isMobile ? styles.leftPanelMobile : styles.leftPanel}>
              {carouselImages.length > 1 && (
                <div className="carouselThumbScroll" style={isMobile ? styles.previewStripMobile : styles.previewStrip}>
                  {carouselImages.map((img, index) => (
                    <button
                      type="button"
                      key={index}
                      style={{
                        ...styles.previewThumb,
                        border: index === carouselIndex ? "2px solid #6A8DFF" : "2px solid transparent",
                      }}
                      onClick={(e) => {
                        setCarouselIndex(index);
                        e.currentTarget.blur();
                      }}
                    >
                      <img src={img} alt="" style={styles.previewThumbImg} draggable={false} />
                    </button>
                  ))}
                </div>
              )}
              <div style={isMobile ? styles.mainImageWrapMobile : styles.mainImageWrap}>
                <img src={carouselImages[carouselIndex]} style={isMobile ? styles.mainPreviewImageMobile : styles.mainPreviewImage} alt="Selected product" />
                <div style={styles.dotsContainer}>
                  {carouselImages.map((_, index) => (
                    <span key={index} style={{ ...styles.dot, backgroundColor: index === carouselIndex ? "#fff" : "transparent" }} onClick={() => setCarouselIndex(index)} />
                  ))}
                </div>
                <button onClick={prevImage} style={{ ...styles.sideNav, left: 10 }} aria-label="Previous image">
                  <svg viewBox="0 0 24 24" style={styles.sideNavIcon}><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button onClick={nextImage} style={{ ...styles.sideNav, right: 10 }} aria-label="Next image">
                  <svg viewBox="0 0 24 24" style={styles.sideNavIcon}><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </div>

            <div style={isMobile ? styles.rightContainerMobile : styles.rightContainer}>
              <div style={styles.rightTop}>
                <h2>{selectedProduct?.name}</h2>
                <p style={styles.productDescription}>{selectedProduct?.description || "No description available"}</p>
              </div>
              <div style={isMobile ? styles.rightBottomMobile : styles.rightBottom}>
                <span style={styles.modalPrice}>₹{parseFloat(selectedProduct?.total_price || 0).toLocaleString('en-IN')}</span>
                <button style={styles.modalAddButton} onClick={() => addToCart(selectedProduct?.id)}>Add To Cart</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const tabStyle = (isActive) => ({
  padding: "10px 20px",
  border: isActive ? "none" : "1px solid #ddd",
  borderRadius: "30px",
  background: isActive ? "linear-gradient(to right, #6A8DFF, #9D7BFF)" : "transparent",
  color: isActive ? "#fff" : "#555",
  cursor: "pointer",
  fontSize: "14px",
  transition: "all 0.2s",
  whiteSpace: "nowrap",
});

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8f9fa",
    color: "#1a1a1a",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  main: {
    paddingTop: 0,
  },
  // Hero Section
  heroSection: {
    width: "100%",
    height: isMobile => isMobile ? 350 : 500,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    textAlign: "center",
    zIndex: 1,
    padding: "0 20px",
  },
  heroTitle: {
    fontSize: isMobile => isMobile ? "28px" : "48px",
    color: "#fff",
    fontWeight: 500,
    marginBottom: "24px",
    fontFamily: "Georgia, serif",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    height: 50,
    borderRadius: 30,
    background: "#fff",
    width: isMobile => "90%",
    maxWidth: 500,
    padding: "0 20px",
    gap: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "15px",
    background: "transparent",
  },
  // Category Section
  categorySection: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "40px 20px",
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
  },
  categoryCard: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    padding: 20,
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  categoryImageWrap: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    background: "#f5f5f5",
    flexShrink: 0,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  categoryContent: {
    textAlign: "left",
  },
  categoryName: {
    margin: "0 0 12px",
    fontSize: 20,
    fontWeight: 600,
    color: "#1a1a1a",
  },
  categoryDescription: {
    margin: "0 0 14px",
    fontSize: 14,
    color: "#555555",
    maxWidth: 260,
  },
  categoryButton: {
    borderRadius: 30,
    padding: "10px 20px",
    background: "linear-gradient(to right, #6A8DFF, #9D7BFF)",
    color: "#fff",
    border: "none",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  // Notice
  noticeContainer: {
    maxWidth: 1400,
    margin: "0 auto 32px",
    textAlign: "center",
    background: "#f7f7f6",
    border: "1px solid rgb(0, 0, 0)",
    borderRadius: 16,
    padding: "30px clamp(18px, 4vw, 38px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
  },
  noticeTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontWeight: 700,
    fontSize: "clamp(24px, 3.4vw, 44px)",
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
    margin: "12px 0 0",
    color: "#333",
    fontSize: "clamp(14px, 2vw, 20px)",
    fontFamily: "Georgia, serif",
    fontWeight: 400,
  },
  // Products Section
  productsSection: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "20px 20px 60px",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: "clamp(24px, 4vw, 36px)",
    fontWeight: 600,
    marginBottom: 24,
    fontFamily: "Georgia, serif",
    color: "#1a1a1a",
  },
  tabs: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 32,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 280px)", // fixed width cards
    gap: 20,
    justifyContent: "center", // THIS centers the grid
  },
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
  skeletonCard: {
    pointerEvents: "none",
    overflow: "hidden",
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
    height: 24,
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
    cursor: "pointer",
    transition: "transform 0.3s",
  },
  cardContent: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
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
  // Modal styles
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "storefrontOverlayIn 220ms ease",
  },
  expandedCard: {
    width: "90vw",
    maxWidth: 1000,
    height: "85vh",
    background: "#fff",
    display: "flex",
    gap: 24,
    padding: 24,
    borderRadius: 16,
    position: "relative",
    animation: "storefrontExpandedCardIn 260ms cubic-bezier(0.2, 0.8, 0.2, 1)",
  },
  expandedCardMobile: {
    width: "100vw",
    height: "100dvh",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: 16,
    overflowY: "auto",
    animation: "storefrontExpandedCardIn 260ms cubic-bezier(0.2, 0.8, 0.2, 1)",
  },
  carouselCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10001,
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "none",
    background: "#fff",
    color: "#333",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  carouselCloseIcon: {
    width: 20,
    height: 20,
  },
  carouselCloseIconMobile: {
    width: 20,
    height: 20,
  },
  leftPanel: {
    flex: 1,
    display: "flex",
    gap: 16,
    alignItems: "stretch",
  },
  leftPanelMobile: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
  previewStrip: {
    flex: "0 0 90px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflowY: "auto",
  },
  previewStripMobile: { 
    flex: "0 0 72px",
    height: "100%",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: 4,
    alignSelf: "stretch",
  },
  previewThumb: {
    width: "100%",
    aspectRatio: "3/4",
    padding: 0,
    borderRadius: 8,
    overflow: "hidden",
    cursor: "pointer",
    background: "#f5f5f5",
    border: "2px solid transparent",
  },
  previewThumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  mainImageWrap: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mainImageWrapMobile: {
    width: "78%",
    aspectRatio: "3/4",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mainPreviewImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  mainPreviewImageMobile: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    border: "1px solid #fff",
    cursor: "pointer",
  },
  sideNav: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "none",
    background: "#fff",
    color: "#333",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  sideNavIcon: {
    width: 20,
    height: 20,
  },
  rightContainer: {
    flex: "0 0 350px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    paddingLeft: 24,
    borderLeft: "1px solid #eee",
  },
  rightContainerMobile: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginTop: 16,
  },
  rightTop: {
    flex: 1,
    overflowY: "auto",
  },
  rightBottom: {
    paddingTop: 16,
    borderTop: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rightBottomMobile: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTop: "1px solid #eee",
  },
  productDescription: {
    marginTop: 16,
    color: "#666",
    lineHeight: 1.6,
    whiteSpace: "pre-line",
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: 600,
    color: "#1a1a1a",
  },
  modalAddButton: {
    padding: "12px 32px",
    background: "linear-gradient(to right, #6A8DFF, #9D7BFF)",
    color: "#fff",
    border: "none",
    borderRadius: "30px",
    fontSize: 16,
    fontWeight: 500,
    cursor: "pointer",
  },
  // Dark theme section
  darkSection: {
    background: "#050b2a",
    padding: "60px 20px 80px",
    marginTop: 20,
  },
  darkSectionInner: {
    maxWidth: 1400,
    margin: "0 auto",
  },
  darkSectionHeader: {
    textAlign: "center",
    marginBottom: 32,
  },
  darkSectionTitle: {
    margin: 0,
    fontSize: "clamp(24px, 4vw, 32px)",
    fontWeight: 600,
    color: "#ffffff",
    fontFamily: "Georgia, serif",
  },
  darkSectionSubtitle: {
    marginTop: 12,
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
  },
  darkGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
  },
};
