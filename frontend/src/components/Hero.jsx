import { useState, useEffect } from "react";
import api from "../api";

// Fallback static image
const fallbackImage = "/icons/4.jpeg";

export default function Hero() {
  const [heroImage, setHeroImage] = useState(fallbackImage);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch hero image from backend
  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const response = await api.get("/products");
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Get the first product's first image as hero image
          const firstProduct = response.data[0];
          if (firstProduct.images) {
            if (Array.isArray(firstProduct.images) && firstProduct.images.length > 0) {
              setHeroImage(firstProduct.images[0]);
            } else if (typeof firstProduct.images === 'string') {
              setHeroImage(firstProduct.images);
            }
          }
        }
      } catch (error) {
        console.log("Using fallback hero image");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroImage();
  }, []);

  return (
    <section className="hero-section" style={styles.heroSection}>
      {!isLoading && (
        <img
          src={heroImage}
          alt="Bursana hero banner"
          style={styles.heroImage}
          onError={(e) => {
            // Fallback to static image on error
            e.target.src = fallbackImage;
          }}
        />
      )}

      <div style={styles.heroOverlay} />

      <div style={styles.heroContent}>
        <h1 style={styles.heroTitle} className="hero-title">
          Discover Elegance
        </h1>
        <form
          style={styles.searchBar}
          className="search-bar"
          onSubmit={(e) => e.preventDefault()}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#999"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search for products..."
            style={styles.searchInput}
          />
        </form>
      </div>
    </section>
  );
}

const styles = {
  heroSection: {
    position: "relative",
    width: "100%",
    height: 500,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(120deg, rgba(3, 9, 32, 0.85), rgba(32, 7, 54, 0.65))",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    padding: "0 20px",
  },
  heroTitle: {
    fontSize: 48,
    color: "#ffffff",
    fontWeight: 500,
    letterSpacing: "0.08em",
    marginBottom: 24,
    fontFamily: "Georgia, serif",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    height: 52,
    borderRadius: 9999,
    background: "#ffffff",
    maxWidth: 500,
    width: "90%",
    padding: "0 20px",
    gap: 12,
    boxShadow: "0 18px 45px rgba(0,0,0,0.3)",
    margin: "0 auto",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 15,
    background: "transparent",
  },
};
