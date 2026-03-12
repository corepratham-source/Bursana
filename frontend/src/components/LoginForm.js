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
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <input
                type="text"
                placeholder="Email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                style={{
                    height: "45px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    padding: "0 12px",
                    fontSize: "14px",
                    outline: "none",
                    width: "100%",
                }}
            />

            <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                    height: "45px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    padding: "0 12px",
                    fontSize: "14px",
                    outline: "none",
                    width: "100%",
                }}
            />

            <button 
                type="submit" 
                disabled={loading}
                style={{
                    height: "45px",
                    background: "black",
                    color: "white",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    transition: "all 0.2s ease",
                }}
            >
                {loading ? "Signing in..." : "Login"}
            </button>

        </form>
    );
}
