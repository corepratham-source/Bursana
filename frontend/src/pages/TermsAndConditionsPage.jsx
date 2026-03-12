export default function TermsAndConditionsPage() {
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
        Terms and Conditions
      </h1>

      <div style={{ 
        background: "#fff", 
        padding: "30px", 
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          Welcome to Bursana. By accessing or using this website, you agree to 
          comply with and be bound by the following terms and conditions.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          1. Use of Website
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          You agree to use this website only for lawful purposes and in a way 
          that does not infringe the rights of, restrict or inhibit anyone else's 
          use and enjoyment of the website.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          2. Product Information
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          We strive to ensure that all product information displayed on the 
          website is accurate. However, errors may occasionally occur. We reserve 
          the right to correct any errors without prior notice.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          3. Pricing and Payment
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          All prices are subject to change without notice. Payment must be 
          received before orders are processed.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          4. Changes to Terms
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          Bursana reserves the right to modify these terms at any time. Your 
          continued use of the website constitutes acceptance of any modified terms.
        </p>
      </div>
    </div>
  );
}
