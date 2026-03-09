import { useContext } from "react";
import { AlertContext } from "../context/AlertContext";

export default function useAlert() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAlert must be used inside AlertProvider");
  }

  return context;
}
