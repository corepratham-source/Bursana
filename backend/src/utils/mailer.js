const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


exports.sendOtpEmail = async ({ to, otp }) => {
  const html = `
  <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px">
    <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:8px; padding:24px">
      
      <h2 style="color:#111; margin-bottom:10px">Verify your email</h2>
      
      <p style="color:#444; font-size:14px">
        Use the OTP below to complete your registration on <strong>Bursana</strong>.
      </p>

      <div style="
        margin:24px 0;
        padding:16px;
        background:#f0f4ff;
        text-align:center;
        border-radius:6px;
        font-size:28px;
        letter-spacing:4px;
        font-weight:bold;
        color:#2b4eff;
      ">
        ${otp}
      </div>

      <p style="font-size:13px; color:#666">
        This OTP is valid for <strong>5 minutes</strong>.  
        If you didn’t request this, you can safely ignore this email.
      </p>

      <hr style="margin:24px 0; border:none; border-top:1px solid #eee" />

      <p style="font-size:12px; color:#999">
        © ${new Date().getFullYear()} Bursana. All rights reserved.
      </p>
    </div>
  </div>
  `;

  // await transporter.sendMail({
  //   from: process.env.EMAIL_FROM,
  //   to,
  //   subject: "Your Bursana OTP Verification Code",
  //   html,
  // });

  const result = await resend.emails.send({
    from: "Bursana <onboarding@resend.dev>",
    to: [to],
    subject: "Your OTP for Bursana",
    html,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
};
