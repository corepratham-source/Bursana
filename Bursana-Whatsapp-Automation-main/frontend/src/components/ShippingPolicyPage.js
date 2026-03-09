export default function ShippingPolicyPage() {
  return (
    <section style={styles.page}>
      <div style={styles.inner}>
        <article style={styles.card}>
          <h1 style={styles.title}>Shipping Policy</h1>

          <section style={styles.section}>
            <h2 style={styles.subheading}>How much does it cost to ship?</h2>
            <p style={styles.paragraph}>
              Shipping costs vary from item to item and are pin-code dependent.
              In some cases, shipping costs are already taken into account in
              the price of the product.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>
              When will I get my order? How long will it take?
            </h2>
            <p style={styles.paragraph}>
              Please refer to the product page for estimated shipping and
              delivery times for domestic and international orders. After being
              placed, domestic orders are processed within 5-25 days, while
              international orders are processed within 7-30 days.
            </p>
            <p style={styles.paragraph}>
              If you have ordered multiple items, please be aware that they may
              arrive in multiple shipments. There may occasionally be unavoidable
              delays that are beyond our control, so the estimated delivery
              times are only a guide. If there are any delays, we will inform
              you.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>
              What should I do if my order is delivered late?
            </h2>
            <p style={styles.paragraph}>
              We will make every effort to convey your items to you inside the
              dispensed time spans. Please contact us at
              {" "}
              <a href="mailto:shop@bursana.com" style={styles.link}>
                shop@bursana.com
              </a>
              {" "}
              or by calling +91-9830027668 (Bursana Fashion customer service
              number), Monday through Saturday, 10 a.m. to 7 p.m. On the off
              chance that the bundle has not shown up by the normal conveyance
              date, we will make every effort to resolve your problems.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>
              My order has been shipped. Can I track it?
            </h2>
            <p style={styles.paragraph}>
              Once it has been shipped, you can follow your order within India
              from the My Order section.
            </p>
          </section>
        </article>
      </div>
    </section>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 74px)",
    background: "#f7f7f6",
    padding: "34px 20px 64px",
    boxSizing: "border-box",
  },
  inner: {
    maxWidth: 900,
    margin: "0 auto",
  },
  card: {
    background: "#fff",
    border: "1px solid #ececec",
    borderRadius: 16,
    padding: "30px clamp(18px, 4vw, 38px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
  },
  title: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontWeight: 400,
    fontSize: "clamp(30px, 4vw, 44px)",
    color: "#171717",
  },
  section: {
    marginTop: 24,
    paddingTop: 18,
    borderTop: "1px solid #f0f0f0",
  },
  subheading: {
    margin: 0,
    fontSize: 19,
    fontWeight: 600,
    color: "#1e1e1e",
  },
  paragraph: {
    margin: "10px 0 0",
    color: "#3f3f3f",
    lineHeight: 1.85,
    fontSize: 15,
  },
  link: {
    color: "#202020",
  },
};
