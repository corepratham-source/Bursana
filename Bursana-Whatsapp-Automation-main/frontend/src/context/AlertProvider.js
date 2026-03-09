import { useState } from "react";
import { AlertContext } from "./AlertContext";

export default function AlertProvider({ children }) {
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "error",      // "error" | "success"
    variant: "alert",   // "alert" | "message"
  });

  /* 🔹 Top floating alert (existing behavior) */
  const showAlert = (message, type = "error", duration = 3000) => {
    setAlert({
      show: true,
      message,
      type,
      variant: "alert",
    });

    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, duration);
  };

  /* 🔹 Center screen message (NEW) */
  const showMessage = (message, type = "error", duration = 10000) => {
    setAlert({
      show: true,
      message,
      type,
      variant: "message",
    });

    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, duration);
  };

  return (
    <AlertContext.Provider value={{ showAlert, showMessage }}>
      {children}

      {alert.show && (
        <div
          style={{
            ...(alert.variant === "alert" ? alertBox : messageBox),
            backgroundColor:
              alert.type === "success" ? "#e6fffa" : "#ffe6e6",
            borderColor:
              alert.type === "success" ? "#2c7a7b" : "#cc0000",
            color:
              alert.type === "success" ? "#065f46" : "#990000",
          }}
        >
          {alert.message}
        </div>
      )}
    </AlertContext.Provider>
  );
}

/* ================= STYLES ================= */

const alertBox = {
  position: "fixed",
  top: 20,
  left: "50%",
  transform: "translateX(-50%)",
  padding: "12px 18px",
  borderRadius: 10,
  border: "1px solid",
  fontSize: 14,
  fontWeight: 600,
  boxShadow: "2px 4px 12px rgba(0,0,0,0.15)",
  zIndex: 999999999,
};

const messageBox = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  padding: "18px 24px",
  borderRadius: 12,
  border: "1px solid",
  fontSize: 16,
  fontWeight: 700,
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  zIndex: 999999999,
};
