import nodemailer from "nodemailer";

const transporterPromises = new Map();

const createTransporter = (allowInsecureTls = false) => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER || "karanbagal021@gmail.com";
  const pass = process.env.SMTP_PASS || "mwnjhbaxpfvmasqu";

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      tls: allowInsecureTls
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
    });
  }

  // Fallback for local development where SMTP is not configured.
  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

const getTransporter = async (allowInsecureTls = false) => {
  const cacheKey = allowInsecureTls ? "insecure" : "secure";

  if (!transporterPromises.has(cacheKey)) {
    transporterPromises.set(cacheKey, Promise.resolve(createTransporter(allowInsecureTls)));
  }

  return transporterPromises.get(cacheKey);
};

export const sendPasswordResetEmail = async ({ toEmail, username, resetUrl }) => {
  const sendMessage = async (allowInsecureTls = false) => {
    const transporter = await getTransporter(allowInsecureTls);

    return transporter.sendMail({
      from: process.env.MAIL_FROM || "no-reply@hrms.local",
      to: toEmail,
      subject: "Reset your HRMS password",
      text: `Hello ${username || "User"},\n\nUse the link below to reset your password. This link expires in 15 minutes.\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
      html: `
      <p>Hello ${username || "User"},</p>
      <p>Use the link below to reset your password. This link expires in 15 minutes.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
    });
  };

  let info;

  try {
    info = await sendMessage(false);
  } catch (error) {
    const isTlsChainError =
      String(error?.code || "").toUpperCase() === "ESOCKET" &&
      /self-signed certificate/i.test(String(error?.message || ""));

    if (!isTlsChainError) {
      throw error;
    }

    info = await sendMessage(true);

    if (process.env.NODE_ENV !== "production") {
      console.warn("Password reset email sent with insecure TLS fallback because the SMTP certificate chain was not trusted.");
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("Password reset email dispatched:", info.messageId || "(json transport)");
  }
};