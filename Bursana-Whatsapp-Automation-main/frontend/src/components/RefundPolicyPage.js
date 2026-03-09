export default function RefundPolicyPage() {
  return (
    <section style={styles.page}>
      <div style={styles.inner}>
        <article style={styles.card}>
          <h1 style={styles.title}>Refund Policy</h1>

          <section style={styles.section}>
            <h2 style={styles.subheading}>
              What is Bursana Fashion&apos;s return policy?
            </h2>
            <p style={styles.paragraph}>
              Your package&apos;s status can be checked within 24 hours of
              leaving our warehouse or the vendor&apos;s location.
            </p>
            <p style={styles.paragraph}>
              Most of our items are equipped for return and replacements for
              local orders. Because they are custom-made, some products cannot
              be returned. On the product page, each product&apos;s return and
              exchange policy is clearly stated. International orders cannot be
              returned or exchanged, so please be aware of this.
            </p>
            <p style={styles.paragraph}>
              If the product is eligible for return or replacement, you can
              request it from the My Order section of the app within three days
              of delivery. Products that are unused, not washed, undamaged, and
              still in their original packaging are eligible for return, but
              they can only be returned or replaced in their original packaging.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>How are returns handled?</h2>
            <p style={styles.paragraph}>
              When you ask to return the item, a pick-up date is set.
              Subsequent to accepting your return demand, one of our dispatch
              accomplices will come to get the item inside three to five work
              days. As soon as pickup is complete, we will begin processing
              your refund.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Can I cancel my order?</h2>
            <p style={styles.paragraph}>
              Through the My Request area, you can drop your request in 24
              hours or less. Additionally, you can get in touch with us via
              email at
              {" "}
              <a href="mailto:shop@bursana.com" style={styles.link}>
                shop@bursana.com
              </a>
              {" "}
              or by calling +91 9830027668 Monday through Saturday, from 10
              a.m. to 7 p.m.
            </p>
            <p style={styles.notice}>
              Bursana Style claims all authority to drop any request whenever
              without first getting a composed or verbal affirmation from the
              client. Additionally, before delivering an order to a customer,
              the business reserves the right to verify it.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>
              How might I be repaid for the item I returned or dropped?
            </h2>
            <p style={styles.paragraph}>
              The bank account, credit card, or debit card used to pay for
              prepaid orders will receive the funds back. In order to receive a
              refund for Cash on Delivery orders, customers will need to provide
              bank information or a UPI ID.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>
              How long does it take to receive a refund when an order is
              cancelled or a product is returned?
            </h2>
            <p style={styles.paragraph}>
              We will process your refund within three business days if you
              cancel your order. Once our courier partner has received a
              returned item, we will issue a refund.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Can I return a portion of my order?</h2>
            <p style={styles.paragraph}>
              Yes. You can return any eligible products within seven days of
              receiving them. Please be aware that not all products can be
              returned or exchanged.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>This outfit will not fit me.</h2>
            <h3 style={styles.miniHeading}>
              How would it be advisable for me to respond?
            </h3>
            <p style={styles.paragraph}>
              If the item does not fit you, please request a size exchange
              within seven days of receiving it through the My Order section or
              the customer service team. Orders put inside India may once in a
              while be qualified for minor size and fit changes. Subject to
              availability, we will do everything in our power to accommodate
              any size adjustments. If the size you requested is not available,
              we will offer you the option to return the item.
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
  miniHeading: {
    margin: "10px 0 0",
    fontSize: 16,
    fontWeight: 600,
    color: "#2b2b2b",
  },
  paragraph: {
    margin: "10px 0 0",
    color: "#3f3f3f",
    lineHeight: 1.85,
    fontSize: 15,
  },
  notice: {
    margin: "12px 0 0",
    padding: "10px 12px",
    borderRadius: 10,
    background: "#fff7f1",
    border: "1px solid #ffd8be",
    color: "#5c3a24",
    fontSize: 14,
    lineHeight: 1.7,
  },
  link: {
    color: "#202020",
  },
};
