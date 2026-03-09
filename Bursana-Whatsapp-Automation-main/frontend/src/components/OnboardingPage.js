import { useState } from "react";
import api from "../api";
import useAlert from "../hooks/useAlert";

export default function OnboardingPage({ goToLogin = () => {} }) {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  /* ================= ADDRESS ================= */
  const [address, setAddress] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    label: "Home",
  });

  /* ================= PREFERENCES ================= */
  const [prefs, setPrefs] = useState({
    monthly_spend_range: "1000-3000",
    max_clothing_price: 2500,
    shopping_categories: [],
    shopping_frequency: "monthly",
    priority_factor: "price",
  });

  const toggleArrayValue = (key, value) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  /* ================= SUBMIT ================= */
  const submitOnboarding = async () => {
    if (!address.full_name || !address.phone || !address.address_line1) {
      return showAlert("Please fill required address fields");
    }

    try {
      setLoading(true);
      await api.post(
        "/user/onboarding",
        {
          address,
          preferences: prefs,
        },
        { withCredentials: true },
      );
      showAlert("Preferences saved 🎉", "success");
      goToLogin();
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.error || "Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Help us curate your experience</h2>
      <p style={styles.subtext}>
        Answer a few quick questions so we show you products that match your
        style and budget.
      </p>

      {/* ================= ADDRESS ================= */}
      <h3>Shipping Address</h3>

      <input
        style={styles.input}
        placeholder="Full Name"
        onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Phone Number"
        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Address Line 1"
        onChange={(e) =>
          setAddress({ ...address, address_line1: e.target.value })
        }
      />
      <input
        style={styles.input}
        placeholder="Address Line 2 (optional)"
        onChange={(e) =>
          setAddress({ ...address, address_line2: e.target.value })
        }
      />
      <input
        style={styles.input}
        placeholder="City"
        onChange={(e) => setAddress({ ...address, city: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="State"
        onChange={(e) => setAddress({ ...address, state: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Pincode"
        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
      />

      {/* ================= PREFERENCES ================= */}
      <h3>Shopping Preferences</h3>

      {/* Monthly Spend */}
      <label>How much do you usually spend online per month?</label>
      <select
        style={styles.select}
        value={prefs.monthly_spend_range}
        onChange={(e) =>
          setPrefs({ ...prefs, monthly_spend_range: e.target.value })
        }
      >
        <option value="0-1000">₹0 – ₹1,000</option>
        <option value="1000-3000">₹1,000 – ₹3,000</option>
        <option value="3000-5000">₹3,000 – ₹5,000</option>
        <option value="5000-10000">₹5,000 – ₹10,000</option>
        <option value="10000+">₹10,000+</option>
      </select>

      {/* Max Clothing Price */}
      <label>What’s the maximum you’re willing to pay for an item?</label>
      <select
        style={styles.select}
        value={prefs.max_clothing_price}
        onChange={(e) =>
          setPrefs({
            ...prefs,
            max_clothing_price: Number(e.target.value),
          })
        }
      >
        <option value={500}>Under ₹500</option>
        <option value={1000}>₹500 – ₹1,000</option>
        <option value={2500}>₹1,000 – ₹2,500</option>
        <option value={5000}>₹2,500 – ₹5,000</option>
        <option value={10000}>₹5,000+</option>
      </select>

      {/* Shopping Frequency */}
      <label>How often do you shop online?</label>
      <select
        style={styles.select}
        value={prefs.shopping_frequency}
        onChange={(e) =>
          setPrefs({ ...prefs, shopping_frequency: e.target.value })
        }
      >
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="occasionally">Occasionally</option>
        <option value="sales-only">Only during sales</option>
      </select>

      {/* Priority */}
      <label>What matters most to you when shopping?</label>
      <select
        style={styles.select}
        value={prefs.priority_factor}
        onChange={(e) =>
          setPrefs({ ...prefs, priority_factor: e.target.value })
        }
      >
        <option value="price">Best price</option>
        <option value="quality">Quality</option>
        <option value="brand">Brand</option>
        <option value="delivery">Fast delivery</option>
        <option value="discounts">Discounts</option>
      </select>

      {/* Categories */}
      <label>What do you usually shop for?</label>
      <div style={styles.multiRow}>
        {[
          "Clothing",
          "Footwear",
          "Accessories",
          "Electronics",
          "Beauty",
          "Home",
        ].map((c) => (
          <button
            key={c}
            style={styles.multiBtn(prefs.shopping_categories.includes(c))}
            onClick={() => toggleArrayValue("shopping_categories", c)}
          >
            {c}
          </button>
        ))}
      </div>

      <button
        style={styles.submit}
        onClick={submitOnboarding}
        disabled={loading}
      >
        {loading ? "Saving..." : "Continue to Store"}
      </button>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    maxWidth: 440,
    margin: "40px auto",
    padding: 24,
    border: "1px solid #ddd",
    borderRadius: 12,
    boxShadow: "2px 2px 12px rgba(0,0,0,0.08)",
  },
  subtext: {
    fontSize: 13,
    color: "#555",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  select: {
    width: "100%",
    padding: 10,
    marginBottom: 14,
    borderRadius: 6,
  },
  multiRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  multiBtn: (active) => ({
    padding: "8px 14px",
    borderRadius: 18,
    border: "1px solid #000",
    background: active ? "#000" : "#fff",
    color: active ? "#fff" : "#000",
    cursor: "pointer",
    fontWeight: 500,
  }),
  submit: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    background: "#000",
    color: "#fff",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
  },
};
