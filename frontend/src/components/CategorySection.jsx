import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Background colors for categories
  const bgColors = ["#fdf7f2", "#f8f3fc", "#f3f9f5", "#fef3c7", "#e0f2fe", "#fce7f3"];

  // Fetch products from backend to create dynamic categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/products");
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Group products by category and get first image from each
          const categoryMap = {};
          
          response.data.forEach((product) => {
            // Use product category or name as category key
            const categoryName = product.category || product.name?.split(' ')[0] || "Other";
            const categoryKey = categoryName.toLowerCase();
            
            if (!categoryMap[categoryKey]) {
              // Get the first image from the product
              let imageUrl = null;
              if (product.images) {
                if (Array.isArray(product.images) && product.images.length > 0) {
                  imageUrl = product.images[0];
                } else if (typeof product.images === 'string') {
                  imageUrl = product.images;
                }
              }
              
              if (imageUrl) {
                categoryMap[categoryKey] = {
                  name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
                  description: product.description?.substring(0, 60) || "Elegant traditional wear",
                  price: product.total_price ? `₹${product.total_price.toLocaleString()}` : "₹999+",
                  image: imageUrl,
                  link: `/products/${categoryKey}`,
                  bg: bgColors[Object.keys(categoryMap).length % bgColors.length],
                };
              }
            }
          });

          // Convert to array and limit to 3 categories
          const dynamicCategories = Object.values(categoryMap).slice(0, 3);
          
          if (dynamicCategories.length > 0) {
            setCategories(dynamicCategories);
          }
        }
        // If no products, categories stays empty
      } catch (error) {
        console.log("Failed to fetch categories from backend");
        // Categories stays empty - no fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Don't render if no categories available
  if (!isLoading && categories.length === 0) {
    return null;
  }

  return (
    <>
      <style>{`
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        @media (max-width: 900px) {
          .cat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .cat-grid { grid-template-columns: 1fr; }
        }
        .cat-card {
          transition: box-shadow 0.22s, transform 0.22s;
        }
        .cat-card:hover {
          box-shadow: 0 10px 32px rgba(0,0,0,0.13) !important;
          transform: translateY(-3px);
        }
      `}</style>

      <section
        style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}
        id="categories"
      >
        {isLoading ? (
          // Loading skeleton
          <div className="cat-grid">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: "#f5f5f5",
                  borderRadius: 18,
                  height: 150,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="cat-grid">
            {categories.map((cat, index) => (
              <Link
                key={cat.name + index}
                to={cat.link}
                className="cat-card"
                style={{
                  background: cat.bg,
                  borderRadius: 18,
                  boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
                  display: "flex",
                  alignItems: "stretch",
                  textDecoration: "none",
                  overflow: "hidden",
                  height: 150,
                }}
              >
                {/* ── Left: text block ── */}
                <div style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "18px 16px",
                }}>
                  <h3 style={{
                    margin: "0 0 7px 0",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#1a1a1a",
                    fontFamily: "Georgia, serif",
                  }}>
                    {cat.name}
                  </h3>

                  <p style={{
                    margin: "0 0 8px 0",
                    fontSize: 11,
                    color: "#aaa",
                    lineHeight: 1.55,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {cat.description}
                  </p>

                  <p style={{
                    margin: "0 0 12px 0",
                    fontSize: 11,
                    color: "#c0c0c0",
                    fontWeight: 500,
                  }}>
                    {cat.price}
                  </p>

                  {/* Shop Now pill */}
                  <div style={{
                    alignSelf: "flex-start",
                    padding: "5px 16px",
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #60a5fa 0%, #a855f7 100%)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.3px",
                    boxShadow: "0 2px 10px rgba(96,165,250,0.35)",
                  }}>
                    Shop Now
                  </div>
                </div>

                {/* ── Right: image covers full card height ── */}
                <div style={{
                  width: 115,
                  flexShrink: 0,
                  overflow: "hidden",
                }}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top center",
                      display: "block",
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
