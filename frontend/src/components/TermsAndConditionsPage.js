export default function TermsAndConditionsPage() {
  return (
    <section style={styles.page}>
      <div style={styles.inner}>
        <article style={styles.card}>
          <h1 style={styles.title}>Terms &amp; Conditions</h1>
          <p style={styles.lead}>
            The following agreement, which is a legally binding contract between
            you and Bursana, the owner of this website, outlines the terms of
            use. Bursana, located at Kolkata - 700064, is the sole proprietor,
            author, operator, and publisher of this website.
          </p>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Website Terms of Use</h2>
            <p style={styles.paragraph}>
              By accepting these Terms of Use, you acknowledge that you have
              fully read and understood the agreements.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Acceptance</h2>
            <p style={styles.paragraph}>
              By accessing and utilizing any of the services provided on this
              website, you acknowledge and accept these terms and conditions. If
              you do not agree to any of the terms, please refrain from using
              the website.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Modification</h2>
            <p style={styles.paragraph}>
              All information presented on the website at
              {" "}
              <a href="http://www.bursana.com" style={styles.link}>
                www.bursana.com
              </a>
              {" "}
              is owned by Bursana and is protected by applicable copyright laws.
              Any alteration, transmission, publication, transfer, reproduction,
              sale, distribution, performance, reposting, display, or commercial
              use of the content on this website is strictly prohibited.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Eligibility</h2>
            <p style={styles.paragraph}>
              Individuals under the age of 18 and users who have been suspended
              or removed by the system are not eligible to use the services of
              this website. If you are a minor, your purchase on the website
              must be authorized by your parents or legal guardian.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Guarantees and Warranties</h2>
            <p style={styles.paragraph}>
              We disclaim all express or implied warranties to the fullest
              extent permitted by law and are not liable for any losses,
              damages, or costs incurred from your use of our website. This
              disclaimer of responsibility applies even in cases of injury or
              harm caused by errors, performance failures, interruptions,
              omissions, cancellations, delays, defects, theft, destruction,
              negligence, or any other actions.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Suspension of the Website</h2>
            <p style={styles.paragraph}>
              If there is a threat to the website&apos;s security or its ability
              to function due to computer viruses, malware, bugs, or other
              technical issues, we reserve the right to suspend the website or
              any of its services at any time.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>
              Product Information and Promotional Offers
            </h2>
            <p style={styles.paragraph}>
              While we make every effort to provide accurate product
              information, including pricing details, we assume no liability for
              typographical errors. If any product&apos;s pricing information is
              incorrect, we may, at our discretion, cancel your order and
              notify you of the cancellation or contact you for further
              instructions. We reserve the right to modify pricing information
              for any product and may contact you using the phone number or
              email provided during registration.
            </p>
            <p style={styles.paragraph}>
              All product prices, including delivery charges and additional
              fees, are displayed in Indian Rupees (INR). Prices are accurate
              at the time of display but are subject to change.
            </p>
            <p style={styles.paragraph}>
              We have made diligent efforts to display the colors of the
              products as accurately as possible. The measurements,
              specifications, and descriptions of products on our website are
              accurately mentioned based on their characteristics. However,
              certain materials may have slight variations in measurements due
              to their inherent characteristics.
            </p>
            <p style={styles.paragraph}>
              Occasionally, we offer promotional discounts in the form of
              discount codes for specific products. Only one discount code can
              be used at the time of purchase. Once an order has been placed, a
              discount code cannot be applied.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Taxes</h2>
            <p style={styles.paragraph}>
              When purchasing any product from our website, you are responsible
              for all applicable taxes, including GST, service tax, VAT/CST,
              cesses, and duties.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Third-party Links</h2>
            <p style={styles.paragraph}>
              The website may contain links to other websites. Your use of the
              information on these websites is entirely at your own risk as we
              do not endorse them. We disclaim all responsibility for any harm
              or damages incurred from using the products featured on these
              websites.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Cancellation Policy</h2>
            <p style={styles.paragraph}>
              We reserve the right to accept or deny any request to cancel your
              order. If you wish to cancel your order, you must do so within 24
              hours of placing the order. We have sole discretion in
              determining whether an order has been processed, and if it has, we
              will not cancel it.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Fraud</h2>
            <p style={styles.paragraph}>
              Users who engage in fraudulent activities on the website may be
              held responsible for the cost of products, shipping, and other
              expenses. We reserve the right to take legal action against such
              individuals.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Redeem Vouchers</h2>
            <p style={styles.paragraph}>
              As part of our marketing strategy or campaign, Bursana may offer
              redeemable vouchers or promotional codes for a limited time. The
              terms and conditions of these campaigns are solely determined by
              us, and you should familiarize yourself with them.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Dispute Resolution</h2>
            <p style={styles.paragraph}>
              Bursana will make every effort to resolve any complaints regarding
              the services, access, use, comments, or violations of the terms
              of service promptly. In case of dispute resolution, we submit to
              the jurisdiction of the Hon&apos;ble courts in Kolkata, India.
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
  lead: {
    margin: "16px 0 0",
    color: "#4b4b4b",
    lineHeight: 1.8,
    fontSize: 16,
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
