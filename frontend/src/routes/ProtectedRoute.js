import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const mode = localStorage.getItem("mode");
  
  // Parse user if it exists
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    user = null;
  }

  // For supplier routes, check user and mode instead of token
  if (role === "supplier") {
    // Check if user exists and mode is supplier
    if (!user || mode !== "supplier") {
      return <Navigate to="/supplier" />;
    }
    return children;
  }

  // For customer routes, check token
  if (!token) {
    return <Navigate to="/customer" />;
  }

  if (role && mode !== role) {
    return <Navigate to="/" />;
  }

  return children;
}
