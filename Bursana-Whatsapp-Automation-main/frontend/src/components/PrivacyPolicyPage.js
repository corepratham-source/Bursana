export default function PrivacyPolicyPage() {
  return (
    <section style={styles.page}>
      <div style={styles.inner}>
        <article style={styles.card}>
          <h1 style={styles.title}>Privacy Policy</h1>
          <p style={styles.lead}>
            This policy applies to the website Bursana, operated by bursana, a
            company registered under the Companies Act, 2023, with its
            Operation Office located at 11A, Jogendra Garden, Kolkata - 700078.
          </p>
          <p style={styles.paragraph}>
            At bursana, we value your privacy and want to inform you about the
            information we collect when you visit our website and use our
            services, as well as how we use and protect that information.
            Please carefully read the following policy, which outlines the
            collection, possession, storage, management, and protection of your
            personal information.
          </p>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Consent</h2>
            <p style={styles.paragraph}>
              By visiting our site, we assume that you have read and agreed to
              this policy. When you provide personal information on our site,
              you consent to the collection, storage, processing, usage, and
              disclosure of that information in accordance with this policy.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Collection of Information</h2>
            <p style={styles.paragraph}>
              When you visit our site, we actively collect personal information
              such as your full name, email ID, address, phone number, and
              other relevant details. Some sections of our site may require you
              to submit personal information to access certain services, such as
              newsletter subscriptions or making payments. Each section will
              clearly indicate the required and optional information.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Cookies</h2>
            <p style={styles.paragraph}>
              While browsing our site, certain information is automatically
              collected through cookies and other technologies. This information
              helps us determine which parts of our site are most relevant to
              your needs. Disabling cookies may limit your experience of our
              site&apos;s features, so we recommend keeping them enabled.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Confidentiality</h2>
            <p style={styles.paragraph}>
              You are responsible for maintaining the confidentiality of any
              sensitive information, including passwords, submitted to our site.
              You have the right to review and request amendments or deletion of
              your sensitive information if it is inaccurate.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Use and Disclosure of Information</h2>
            <p style={styles.paragraph}>
              Unless otherwise stated, the information you provide may be used
              to improve our site&apos;s content, customize your experience,
              communicate with you (if requested), and market our site based on
              demographics, interests, and behavior. We may share your
              information with affiliates who adhere to this policy.
              Additionally, we may disclose your information to contractors who
              assist us in providing services, as well as when required by law,
              court orders, or government regulations.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Third-Party Links</h2>
            <p style={styles.paragraph}>
              Our site may contain links to third-party websites that may
              collect personally identifiable information about you. Please note
              that their data protection policies are not covered by this
              policy, so use discretion and review their policies when visiting
              and using their services.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Payment Safety</h2>
            <p style={styles.paragraph}>
              We take precautions to protect your personally identifiable
              information from misuse, loss, unauthorized access, alteration, or
              destruction. However, since internet data transmission is not
              fully secure, we cannot guarantee the security of information sent
              to us online. When you enter sensitive payment information on our
              site, it gets encrypted and remains secure, but we disclaim
              responsibility for any misuse of such information.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Disclaimer</h2>
            <p style={styles.paragraph}>
              Our website content may contain typographical errors or
              inaccuracies. While we strive for accuracy, we do not guarantee
              the completeness or accuracy of the data, opinions, advice, or
              statements displayed. We reserve the right to correct any
              inaccuracies without prior notice.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subheading}>Complaints</h2>
            <p style={styles.paragraph}>
              bursana complies with applicable laws and takes privacy concerns
              seriously. If you believe we have not upheld this policy in
              protecting your personal information, please contact us at the
              following:
            </p>
            <p style={styles.contact}>
              Phone: +91 9830027668
              <br />
              Email:
              {" "}
              <a href="mailto:info@bursana.com" style={styles.link}>
                info@bursana.com
              </a>
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
  contact: {
    margin: "12px 0 0",
    padding: "10px 12px",
    borderRadius: 10,
    background: "#f6f8fb",
    border: "1px solid #dfe7f3",
    color: "#313946",
    lineHeight: 1.7,
    fontSize: 14,
  },
  link: {
    color: "#202020",
  },
};
