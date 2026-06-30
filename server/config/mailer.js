import nodemailer from "nodemailer";

/**
 * Returns a Nodemailer transporter.
 * Reads SMTP credentials from environment variables so nothing is
 * hardcoded. Works with Gmail (App Password), SendGrid, Mailgun, etc.
 *
 * Required env vars:
 *   SMTP_HOST     — e.g. smtp.gmail.com
 *   SMTP_PORT     — e.g. 587
 *   SMTP_USER     — your email address / SMTP login
 *   SMTP_PASS     — app password or SMTP API key
 *   SMTP_FROM     — the "From" address shown to recipients
 */
const getMailer = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_PORT === "465", // true only for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

export default getMailer;
