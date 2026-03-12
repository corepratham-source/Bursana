import { useState } from "react";

export default function LoginForm({ onSubmit, loading }) {

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        onSubmit({
            identifier,
            password
        });
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <input
                type="text"
                placeholder="Email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                style={{
                    height: "48px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    padding: "0 14px",
                    fontSize: "14px",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                }}
            />

            <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                    height: "48px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    padding: "0 14px",
                    fontSize: "14px",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                }}
            />

            <button 
                type="submit" 
                disabled={loading}
                style={{
                    height: "48px",
                    background: "#000",
                    color: "white",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    transition: "all 0.2s ease",
                    marginTop: "4px",
                }}
            >
                {loading ? "Signing in..." : "Login"}
            </button>

        </form>
    );
}
