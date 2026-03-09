import { useEffect, useState } from "react";
import api from "../api";
import useAlert from "../hooks/useAlert";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const fileInputRef = useRef(null);
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const [hoveringBurger, setHoveringBurger] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    images: [],
    active: false
  });
  const totalPages = Math.ceil(products.length / pageSize);
    const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
    );

  const { showAlert } = useAlert();

  // Fetch Supplier Products
  const fetchProducts = async () => {
    try {
      const res = await api.get("/management/supplier/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      showAlert("Failed to load products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Open Edit Form
  const startEdit = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      images: product.images || [],
      active: product.active || false
    });
  };
  const addImages = async (files) => {
  try {
    const formData = new FormData();
    [...files].forEach(f => formData.append("images", f));
    showAlert("Uploading images...", "info");
    const res = await api.post(
      `/management/supplier/products/${editing}/images`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setForm(prev => ({ ...prev, images: res.data.images }));
    showAlert("Images added", "success");
  } catch (err) {
    console.error(err);
    showAlert("Image upload failed");
  }
};
const logout = async () => {
  try {
    localStorage.removeItem("user");
    localStorage.removeItem("mode");
    const res = await api.post("/auth/logout");
    if (res.status === 200) {
      showAlert("Logout successful", "success");
      window.location.reload();
    }
  } catch (err) {
    console.error(err);
    showAlert("Logout failed");
  }
};
const removeImage = async (image) => {
  if (!window.confirm("Remove this image?")) return;

  try {
    const res = await api.delete(
      `/management/supplier/products/${editing}/images`,
      { data: { image } }
    );

    setForm(prev => ({ ...prev, images: res.data.images }));
    showAlert("Image removed", "success");
  } catch (err) {
    console.error(err);
    showAlert("Failed to remove image");
  }
};



  // Save Edit
  const saveEdit = async () => {
    try {
      await api.put(`/management/supplier/products/${editing}`, form);
      showAlert("Product Updated", "success");
      setEditing(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      showAlert("Update failed");
    }
  };

  // Delete
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/management/supplier/products/${id}`);
      showAlert("Product Deleted", "success");
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      showAlert("Delete failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2>Manage Products</h2>

        {products.length === 0 && (
          <p style={{ opacity: 0.6 }}>No products yet</p>
        )}

        {paginatedProducts.map(p => (
          <div key={p.id} style={{
              ...styles.card,
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
            }}>
            
            {/* LEFT IMAGE */}
            <img
            src={p.images?.[0]}
            alt=""
            style={{
              ...styles.image,
              width: isMobile ? "100%" : 100,
              height: isMobile ? "80%" : 100,
            }}
          />

            {/* MIDDLE */}
            <div
              style={{
                flex: 1,
                width: "100%",
              }}
            >
              <h3>{p.name || "Unnamed Product"}</h3>
              <p>{p.description || "No description"}</p>
              <strong>₹ {p.price || "N/A"}</strong>
            </div>

            {/* RIGHT ACTIONS */}
            <div style={styles.actions}>
              <button style={styles.editBtn} onClick={() => startEdit(p)}>
                Edit
              </button>

              <button style={styles.deleteBtn} onClick={() => deleteProduct(p.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={styles.pagination}>
        <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
          >
              ◀ Prev
          </button>

          <span>
              Page {currentPage} of {totalPages}
          </span>

          <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
          >
              Next ▶
          </button>
    </div>



      {/* ================= EDIT POPUP ================= */}
      {editing && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>Edit Product</h3>

            <input
              style={styles.input}
              placeholder="Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />

            <textarea
              style={styles.textArea}
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Price"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={e => setForm({ ...form, active: e.target.checked })}
              />
              Set product active?
            </label>
            {/* IMAGE GALLERY */}
            <div style={styles.imageGrid}>
              {form.images.map((img) => (
                <div key={img} style={styles.imageWrap}>
                  <img
                    src={img}
                    style={styles.image}
                    alt=""
                  />
                  <button
                    style={styles.removeImg}
                    onClick={() => removeImage(img)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div style ={{justifyContent: "center",alignItems: "center"}}>
              <button style={{width: "40%"}} onClick={() => fileInputRef.current.click()}>
                Add Images
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                accept="image/*"
                onChange={(e) => addImages(e.target.files)}
              />
            </div>

            

            <div style={{ display: "flex", gap: 10 }}>
              <button style={styles.saveBtn} onClick={saveEdit}>Save</button>
              <button style={styles.cancelBtn} onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


// ================= STYLES =================
const styles = {
  page: {
    minHeight: "100vh"
  },

  container: {
    maxWidth: 900,
    margin: "0 auto"
  },

  card: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    background: "#fff",
    borderRadius: 10,
    padding: 15,
    border: "1px solid #ddd",
    marginBottom: 12
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    objectFit: "cover",
    border: "1px solid #ccc"
  },

  actions: {
      display: "flex",
      flexDirection: window.matchMedia("(max-width: 768px)").matches ? "row" : "column",
      gap: 10,
      width: 80,
      justifyContent: window.matchMedia("(max-width: 768px)").matches ? "space-between" : "flex-start",
    },

  editBtn: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid black",
    cursor: "pointer"
  },

  deleteBtn: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    background: "red",
    color: "#fff",
    cursor: "pointer"
  },

  overlay: {
    position: "fixed",
    top: 0, left: 0,
    right: 0, bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  modal: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    width: 400,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc"
  },

  textArea: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    height: 100,
    resize: "none"
  },

  saveBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "black",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700
  },

  cancelBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "1px solid black",
    background: "#fff",
    cursor: "pointer"
  },

  pagination: {
  marginTop: 20,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 15,
  marginBottom:15
},

paginationBtn: {
  padding: "8px 14px",
  borderRadius: 6,
  border: "1px solid #000",
  background: "#fff",
  cursor: "pointer",
},
imageGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
  gap: 10,
  marginTop: 10
},

imageWrap: {
  position: "relative"
},

removeImg: {
  position: "absolute",
  top: -6,
  right: -6,
  background: "red",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: 20,
  height: 20,
  cursor: "pointer",
  fontSize: 12
},



};
