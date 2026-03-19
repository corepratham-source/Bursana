import { useState } from "react";
import api from "../api";

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;

    try {
      setLoading(true);
      await api.post("newsletter/subscribe",{ email },
        {
            headers: {
            "Content-Type": "application/json",
            },
            withCredentials: false,
        }
      );
      alert("Subscribed successfully!");
      setEmail("");
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        style={styles.button}
      >
        📩
      </button>

      {/* Modal */}
      {open && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h1>Join our Newsletter</h1>
            <br/> 
            <p>Join our newsletter and be the first to discover new arrivals, exclusive deals, and insider updates—straight to your inbox.</p>
            <p> Don’t miss out 🚀</p>
            <br/> 
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={styles.submit}
            >
              {loading ? "Submitting..." : "Subscribe"}
            </button>

            <button
              onClick={() => setOpen(false)}
              style={styles.close}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  button: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 999,
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    fontSize: "24px",   
    background: "none",
    color: "#000",
    border: "1px solid #ccc",
    cursor: "pointer"
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modal: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "500px",
    position: "relative",
    textAlign: "center"
  },
  input: {
    width: "60%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px"
  },
  submit: {
    marginTop: "10px",
    padding: "10px",
    width: "60%",
    background: "#000",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer"
  },
  close: {
    position: "absolute",
    top: "10px",
    right: "10px",
    border: "none",
    background: "none",
    fontSize: "18px",
    cursor: "pointer"
  }
};