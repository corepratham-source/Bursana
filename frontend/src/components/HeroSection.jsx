import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function HeroSection() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bannerImages, setBannerImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasImages, setHasImages] = useState(false);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  // Fetch product images from backend using existing /products endpoint
  useEffect(() => {
    const fetchBannerImages = async () => {
      try {
        // Using the existing products endpoint from the backend
        // This endpoint returns products with images from the database (Cloudinary)
        const response = await api.get("/products");
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Extract images from products
          const images = [];
          
          response.data.forEach((product) => {
            // Handle different image formats (array or single string)
            if (product.images) {
              if (Array.isArray(product.images)) {
                product.images.forEach((img) => {
                  if (img && typeof img === 'string') {
                    images.push(img);
                  }
                });
              } else if (typeof product.images === 'string') {
                // Single image string
                images.push(product.images);
              }
            }
          });

          if (images.length > 0) {
            setBannerImages(images);
            setHasImages(true);
          }
        }
      } catch (error) {
        console.log("No images available from backend for hero section");
        console.error("Error fetching products:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBannerImages();
  }, []);

  // Create slides from dynamic banner images
  const getSlides = () => {
    if (!hasImages || bannerImages.length === 0) {
      // Return empty slides when no images available - will show placeholder
      return [];
    }

    // Create slides from banner images (3 images per slide)
    const slides = [];
    for (let i = 0; i < bannerImages.length; i += 3) {
      slides.push({
        left: bannerImages[i] || null,
        center: bannerImages[i + 1] || null,
        right: bannerImages[i + 2] || null,
      });
    }

    return slides;
  };

  const slides = getSlides();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Don't render hero section if no images available
  if (!hasImages || slides.length === 0 || !slides[0].left) {
    return null;
  }

  const slide = slides[currentSlide];

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: 500,
        overflow: "hidden",
        display: "flex",
      }}
    >
      {/* LEFT Side Image */}
      <div style={{ flex: "0 0 28%", position: "relative", overflow: "hidden" }}>
        <img
          key={`left-${currentSlide}`}
          src={slide?.left}
          alt="Woman in traditional attire"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* CENTER Image — full height */}
      <div style={{ flex: "0 0 44%", position: "relative", overflow: "hidden" }}>
        <img
          key={`center-${currentSlide}`}
          src={slide?.center}
          alt="Traditional attire"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 40%",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>

      {/* RIGHT Side Image */}
      <div style={{ flex: "0 0 28%", position: "relative", overflow: "hidden" }}>
        <img
          key={`right-${currentSlide}`}
          src={slide?.right}
          alt="Woman in traditional attire"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to left, rgba(0,0,0,0.35) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Overlay: Heading + Search + Dots */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        <h1
          style={{
            margin: "0 0 18px 0",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 300,
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: "#ffffff",
            letterSpacing: "0.04em",
            textShadow: "0 2px 28px rgba(0,0,0,0.7)",
            textAlign: "center",
          }}
        >
          Discover{" "}
          <em style={{ fontStyle: "italic", fontWeight: 500 }}>Elegance</em>
        </h1>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            width: "min(500px, 85vw)",
            height: 50,
            background: "rgba(255,255,255,0.95)",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: 12,
            boxShadow: "0 4px 28px rgba(0,0,0,0.35)",
          }}
        >
          <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#666"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Search for sarees, kurtas, lehengas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 16,
              color: "#333",
              fontFamily: "inherit",
            }}
          />
        </form>

        {/* Dot indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20 }}>
          {slides.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: currentSlide === index ? 40 : 10,
                height: 6,
                borderRadius: 999,
                background: currentSlide === index ? "#ffffff" : "rgba(255,255,255,0.4)",
                transition: "all 0.4s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
