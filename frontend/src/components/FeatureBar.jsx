export default function FeatureBar() {
  const features = [
    {
      label: "Fast Shipping",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="#666" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <path d="M16 8h4l3 3v5h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      label: "Excellent Support",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="#666" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      ),
    },
    {
      label: "Easy Returns",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="#666" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-4.51" />
        </svg>
      ),
    },
  ];

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px 28px" }}>
      <div style={{
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 2px 14px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        padding: "18px 28px",
      }}>
        {features.map((f, i) => (
          <div
            key={f.label}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderRight: i < features.length - 1 ? "1px solid #eee" : "none",
              padding: "0 12px",
            }}
          >
            {f.icon}
            <span style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#555",
              whiteSpace: "nowrap",
            }}>
              {f.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}