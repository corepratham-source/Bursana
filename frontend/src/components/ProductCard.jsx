export default function ProductCard({
  product,
  cardImage,
  index,
  isOpening,
  styles,
  addToCart = () => {},
  startCardImageScroll = () => {},
  stopCardImageScroll = () => {},
  hoveredImageIndex,
  variant = "light",
  isInWishlist = false,
  onToggleWishlist = () => {},
  onClick = () => {},
}) {
  if (!product) return null;
  const baseCardStyle = {
    ...styles.card,
    ...styles.cardEnter,
    ...(isOpening ? styles.cardOpening : null),
    animationDelay: `${index * 100}ms`,
  };

  const cardStyle =
    variant === "dark"
      ? {
          ...baseCardStyle,
          background: "#050b2a",
          boxShadow: "0 18px 45px rgba(0,0,0,0.7)",
        }
      : baseCardStyle;

  const productNameStyle =
    variant === "dark"
      ? { ...styles.productName, color: "#f5f5ff" }
      : styles.productName;

  const priceStyle =
    variant === "dark"
      ? { ...styles.price, color: "#ffffff" }
      : styles.price;

  const addButtonStyle =
    variant === "dark"
      ? {
          ...styles.addButton,
          background:
            "linear-gradient(135deg, #FFAA5A 0%, #FF6B9A 100%)",
        }
      : styles.addButton;

  // Wishlist button style
  const wishlistButtonStyle = {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    transition: "all 0.2s ease",
    zIndex: 10,
  };

  return (
    <article
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          variant === "dark"
            ? "0 22px 55px rgba(0,0,0,0.8)"
            : "0 8px 24px rgba(0,0,0,0.1)";
        startCardImageScroll(product);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          variant === "dark"
            ? "0 14px 36px rgba(0,0,0,0.7)"
            : "0 4px 20px rgba(0,0,0,0.05)";
        stopCardImageScroll(product.id);
      }}
    >
      <div style={styles.imageFrame}>
        {/* Wishlist Heart Icon - Navigate to wishlist page */}
        {onToggleWishlist && (
          <button
            style={wishlistButtonStyle}
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to wishlist page - parent component handles this
              if (onToggleWishlist) {
                onToggleWishlist(product.id, e);
              }
            }}
            aria-label="Go to wishlist"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isInWishlist ? "#ef4444" : "none"}
              stroke={isInWishlist ? "#ef4444" : "#6b7280"}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
        <img
          key={`${product.id}-${hoveredImageIndex}`}
          src={cardImage}
          alt={product.name || "Product"}
          style={styles.image}
          onClick={onClick}
        />
      </div>
      <div style={styles.cardContent}>
        <p style={productNameStyle}>
          {product.name || "Unnamed Product"}
        </p>
        <div style={styles.priceRow}>
          <span style={priceStyle}>
            ₹{parseFloat(product.total_price || 0).toLocaleString("en-IN")}
          </span>
          <button
            style={addButtonStyle}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product.product_id);
            }}
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

