import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../api";
import { Helmet } from "react-helmet";
import useAlert from "../hooks/useAlert";

export default function ProductPage() {
  const { id } = useParams();
  const { showAlert } = useAlert();
  const context = useOutletContext() || {};
    
    const {
      refreshCartCount,
      isAuthenticated,
      requireLogin = () => {},
      handleUnauthorized = () => {},
    } = context;
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await api.get(`/products/${id}`);
        setProduct(productRes.data);

        const similarRes = await api.get(`/products/${id}/similar`);
        setSimilar(similarRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id]);
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
  if (!product) return <div>Loading...</div>;

  const images = product.images || [];

  return (
    <div style={styles.page}>
      <Helmet>
        <title>{product.name}</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div style={styles.container}>
        {/* LEFT: IMAGE */}
        <div style={styles.left}>
          <img
            src={images[imageIndex]}
            style={styles.mainImage}
            alt={product.name}
          />

          <div style={styles.thumbRow}>
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setImageIndex(i)}
                style={{
                  ...styles.thumb,
                  border: i === imageIndex ? "2px solid #6A8DFF" : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div style={styles.right}>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <h2>₹{product.total_price}</h2>

          <button style={styles.button} onClick={() => addToCart(product.id)}>
            Add to Cart
          </button>
        </div>
      </div>

      {/* 🔥 USERS ALSO LIKED */}
      <div style={styles.similarSection}>
        <h2>You may also like</h2>

        <div style={styles.similarGrid}>
          {similar.map((item) => (
            <div
              key={item.id}
              style={styles.similarCard}
              onClick={() => window.location.href = `/product/${item.category.toLowerCase()}/${item.id}`}
            >
              <img src={item.images?.[0]} style={styles.similarImg} />
              <p style ={{ fontWeight : 475 }}>{item.name}</p>
              <span style={{ marginTop: "auto" }}>
                ₹{item.total_price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "40px",
    background: "#f8f9fa",
  },
  container: {
    display: "flex",
    gap: "40px",
  },
  left: {
    flex: 1,
  },
  mainImage: {
    width: "100%",
    borderRadius: "12px",
  },
  thumbRow: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  thumb: {
    width: "60px",
    height: "80px",
    objectFit: "cover",
    cursor: "pointer",
    borderRadius: "6px",
  },
  right: {
    flex: 1,
  },
  button: {
    padding: "12px 24px",
    borderRadius: "30px",
    background: "linear-gradient(to right, #6A8DFF, #9D7BFF)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  similarSection: {
    marginTop: "60px",
  },
  similarGrid: {  
    display: "flex",
    gap: "20px",
    overflowX: "auto",
  },
  similarCard: {
    minWidth: "200px",
    background: "#fff",
    padding: "12px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  },
  similarImg: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    borderRadius: "8px",
  },
};