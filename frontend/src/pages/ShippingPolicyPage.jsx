export default function ShippingPolicyPage() {
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
        Shipping Policy
      </h1>

      <div style={{ 
        background: "#fff", 
        padding: "30px", 
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          Orders are processed within 1-2 business days after payment is confirmed.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          1. Processing Time
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          All orders are processed within 1-2 business days. Orders placed on 
          weekends or holidays will be processed on the next business day.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          2. Delivery Time
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          Shipping usually takes between 3-7 business days depending on your 
          location. Delivery times may vary based on the shipping method selected 
          and the destination address.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          3. Shipping Charges
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          Shipping charges may vary based on location and order size. Free shipping 
          may be available for orders above a certain threshold.
        </p>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginTop: "30px", marginBottom: "15px", color: "#333" }}>
          4. Order Tracking
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "20px", color: "#555" }}>
          Once your order ships, you will receive a tracking number via email 
          to monitor the delivery status.
        </p>
      </div>
    </div>
  );
}
