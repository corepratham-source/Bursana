import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const bgColors = ["#fdf7f2", "#f8f3fc", "#f3f9f5", "#fef3c7", "#e0f2fe", "#fce7f3"];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/products");

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const categoryMap = {};

          response.data.forEach((product) => {
            const categoryName =
              product.category || product.name?.split(" ")[0] || "Other";
            const categoryKey = categoryName.toLowerCase();

            if (!categoryMap[categoryKey]) {
              let imageUrl = null;

              if (product.images) {
                if (Array.isArray(product.images) && product.images.length > 0) {
                  imageUrl = product.images[0];
                } else if (typeof product.images === "string") {
                  imageUrl = product.images;
                }
              }

              if (imageUrl) {
                categoryMap[categoryKey] = {
                  name:
                    categoryName.charAt(0).toUpperCase() +
                    categoryName.slice(1),
                  description:
                    product.description?.substring(0, 60) ||
                    "Elegant traditional wear",
                  price: product.total_price
                    ? `₹${product.total_price.toLocaleString()}`
                    : "₹999+",
                  image: imageUrl,
                  link: `/products/${categoryKey}`,
                  bg:
                    bgColors[
                      Object.keys(categoryMap).length % bgColors.length
                    ],
                };
              }
            }
          });

          const dynamicCategories = Object.values(categoryMap).slice(0, 3);

          if (dynamicCategories.length > 0) {
            setCategories(dynamicCategories);
          }
        }
      } catch (error) {
        console.log("Failed to fetch categories from backend");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (!isLoading && categories.length === 0) {
    return null;
  }

  const shimmerStyle = {
    background:
      "linear-gradient(90deg, #f1f1f1 0%, #ececec 35%, #f1f1f1 70%, #f1f1f1 100%)",
    backgroundSize: "220% 100%",
    animation: "storefrontShimmer 3s ease-in-out infinite",
  };

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

        /* EXACT same shimmer */
        @keyframes storefrontShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <section
        style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}
        id="categories"
      >
        {isLoading ? (
          <div className="cat-grid">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  borderRadius: 18,
                  height: 150,
                  display: "flex",
                  overflow: "hidden",
                  background: "#f1f1f1",
                }}
              >
                {/* Left skeleton */}
                <div style={{ flex: 1, padding: "18px 16px" }}>
                  <div style={{
                    ...shimmerStyle,
                    height: 14,
                    width: "60%",
                    borderRadius: 6,
                    marginBottom: 10,
                    animationDelay: `${i * 0.1}s`,
                  }} />

                  <div style={{
                    ...shimmerStyle,
                    height: 10,
                    width: "80%",
                    borderRadius: 6,
                    marginBottom: 8,
                    animationDelay: `${i * 0.15}s`,
                  }} />

                  <div style={{
                    ...shimmerStyle,
                    height: 10,
                    width: "40%",
                    borderRadius: 6,
                    marginBottom: 12,
                    animationDelay: `${i * 0.2}s`,
                  }} />

                  <div style={{
                    ...shimmerStyle,
                    height: 24,
                    width: 90,
                    borderRadius: 999,
                    animationDelay: `${i * 0.25}s`,
                  }} />
                </div>

                {/* Right image skeleton */}
                <div
                  style={{
                    width: 115,
                    ...shimmerStyle,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              </div>
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