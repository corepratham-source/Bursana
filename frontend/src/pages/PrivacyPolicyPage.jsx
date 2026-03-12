export default function PrivacyPolicyPage() {
  return (
    <div style={{ 
      padding: "120px 20px 60px", 
      maxWidth: "800px", 
      margin: "0 auto",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ 
        fontSize: "36px", 
        fontWeight: "700", 
        marginBottom: "30px",
        color: "#1a1a1a",
        textAlign: "center"
      }}>
        Privacy Policy
      </h1>

      <div style={{ 
        background: "#fff", 
        padding: "30px", 
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          Your privacy is important to us. This policy explains how we collect, 
          use, and protect your personal information.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          1. Information We Collect
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          We may collect personal information such as name, email address, 
          phone number, shipping address, and payment information when you 
          create an account or place an order.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          2. How We Use Information
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          The information collected is used to process orders, improve our 
          services, communicate with customers about their orders, and send 
          promotional emails if you have opted in.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          3. Data Protection
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          We implement security measures to protect your data from unauthorized 
          access. All sensitive information is encrypted and stored securely.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          4. Sharing Information
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          We do not sell or share your personal information with third parties 
          except as necessary to process your orders and comply with legal requirements.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          5. Your Rights
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          You have the right to access, update, or delete your personal information 
          at any time by contacting our customer support team.
        </p>
      </div>
    </div>
  );
}
