export default function RefundPolicyPage() {
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
        Refund Policy
      </h1>

      <div style={{ 
        background: "#fff", 
        padding: "30px", 
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          If you are not satisfied with your purchase, you may request a refund 
          within 7 days of receiving the product.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          1. Eligibility for Refund
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          To be eligible for a refund, the product must be unused and returned in 
          the same condition it was received, with all original tags and packaging intact.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          2. Refund Process
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          To initiate a refund, please contact our customer support team with your 
          order number and reason for the refund request.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          3. Refund Processing Time
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          Refunds will be processed within 5-7 business days after the product 
          is returned and inspected. The refund will be credited to your original 
          payment method.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          4. Non-Refundable Items
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          Certain items such as perishable goods, personalized products, and 
          intimate items may not be eligible for refund.
        </p>
      </div>
    </div>
  );
}
