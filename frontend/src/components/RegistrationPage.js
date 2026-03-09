import { useState, useEffect } from "react";
import api from "../api";
import useAlert from "../hooks/useAlert";

export default function RegistrationPage({
  goToLogin,
  goToOnboarding,
  asModal = false,
  onClose,
}) {
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [otp, setOtp] = useState("");

  // 🔹 OTP TIMER STATE
  const [isOtpDisabled, setIsOtpDisabled] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0); // seconds

  const { showAlert } = useAlert();

  /* ================= OTP COUNTDOWN ================= */
  useEffect(() => {
    if (otpTimer === 0) {
      setIsOtpDisabled(false);
      return;
    }

    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };
  const isValidEmail = (email) => {
    // RFC 5322–safe enough for frontend validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return emailRegex.test(email.trim());
  };

  /* ================= REGISTER ================= */
  const register = async () => {
    if (!phone || !password || !confirmPassword) {
      return showAlert("All fields are required");
    }

    if (password !== confirmPassword) {
      return showAlert("Passwords do not match");
    }
    const fullPhone = `${countryCode}${phone}`;
    console.log("REGISTER PAYLOAD", {
        identifier: email,
        phone: fullPhone,
        name,
        email,
        password,
        otp,
      });
    try { 
      setRegistered(true);
      await api.post("/auth/register/verifyOtp", {
        identifier : email,
        phone: fullPhone,
        name,
        email,
        password,
        otp,
      },
      { withCredentials: false }
    );
      showAlert("Registration successful.", "success");
      goToOnboarding();
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.error || "Registration failed");
    } finally {
      setRegistered(false);
    }
  };

  /* ================= REQUEST OTP ================= */
  const otpRequest = async () => {
    if (!email) {
      return showAlert("Email is required to send OTP");
    }
    if (!isValidEmail(email)) {
      return showAlert("Please enter a valid email address");
    }
    if (!phone) { 
      return showAlert("Phone number is required");
    }

    try {
      setLoading(true);
      await api.post("/auth/register/requestOtp", {
        identifier : email,
      },
      {
        withCredentials: false,
        headers: {
          "x-csrf-token": undefined, // 🔑 IMPORTANT
        },
      },
    );

      showAlert("OTP sent to your email", "success");
      setLoading(false);
      // 🔹 START 5 MIN TIMER
      setIsOtpDisabled(true);
      setOtpTimer(300);
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.error || "OTP request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={asModal ? modalOverlay : page}
      onClick={asModal ? onClose : undefined}
    >
      <div
        style={asModal ? modalContainer : container}
        onClick={asModal ? (e) => e.stopPropagation() : undefined}
      >
        {asModal && (
          <button type="button" style={closeButton} onClick={onClose}>
            x
          </button>
        )}
        <h2>Register</h2>

        {/* PHONE INPUT */}
        <div style={phoneWrapper}>
          <select
            style={countrySelect}
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          >
            <option value="+91">🇮🇳 +91</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
            <option value="+61">🇦🇺 +61</option>
            <option value="+971">🇦🇪 +971</option>
          </select>

          <input
            style={phoneInput}
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        <input
          style={input}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          style={input}
          type="email"
          placeholder="Email"
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          style={input}
          type="password"
          placeholder="Re-enter Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* OTP SECTION */}
        <div style={otpWrapper}>
          <input
            style={otpInput}
            type="password"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            style={{
              ...otpButton,
              opacity: isOtpDisabled ? 0.6 : 1,
              cursor: isOtpDisabled ? "not-allowed" : "pointer",
              fontWeight: isOtpDisabled ? "400" : "600",
            }}
            onClick={otpRequest}
            disabled={isOtpDisabled}
          >
            {isOtpDisabled ? "Resend OTP" : "Send OTP"}
          </button>
        </div>

        {isOtpDisabled && (
          <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>
            Resend OTP in {formatTime(otpTimer)}
          </p>
        )}

        <button
          style={loginButton}
          onClick={register}
          disabled={loading}
        >
          {loading ? "Sending OTP..." : registered? "Registering...":"Register"}
        </button>

        <p style={{ marginTop: 16 }}>
          Already have an account? <br />
          <span style={link} onClick={goToLogin}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

/* ===================== STYLES ===================== */
const page = {
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundImage: `url(https://res.cloudinary.com/dwnzd0c2t/image/upload/v1770285034/ChatGPT_Image_Feb_5_2026_03_20_13_PM_nciv3r.png)`, // 👈 put image in /public
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 15000,
  padding: 16,
};

const container = {
  maxWidth: 240,
  margin: "80px auto",
  padding: 24,
  background: "rgba(255, 255, 255, 0.84)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  border: "1px solid #ddd",
  borderRadius: 12,
  textAlign: "center",
  boxShadow: "2px 2px 10px rgba(0,0,0,0.08)",
};

const modalContainer = {
  ...container,
  position: "relative",
  margin: 0,
  width: "100%",
  maxWidth: 360,
};

const closeButton = {
  position: "absolute",
  right: 10,
  top: 10,
  width: 26,
  height: 26,
  borderRadius: "50%",
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};

const phoneWrapper = {
  display: "flex",
  gap: 8,
  marginBottom: 12,
};

const otpWrapper = {
  display: "flex",
  gap: 8,
  marginBottom: 12,
};

const countrySelect = {
  width: "40%",
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const phoneInput = {
  width: "53%",
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const otpInput = {
  width: "53%",
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const input = {
  width: "91%",
  padding: 10,
  marginBottom: 12,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const loginButton = {
  width: "100%",
  padding: 10,
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "600",
};

const otpButton = {
  width: "50%",
  padding: 10,
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: 8,
};

const link = {
  color: "blue",
  cursor: "pointer",
};
