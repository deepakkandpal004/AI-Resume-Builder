import { auth } from "../config/firebase.js";
import getMailer from "../config/mailer.js";

const frontendUrl = () =>
  process.env.CLIENT_URL?.split(",")[0] || "http://localhost:5173";

const getSender = () => {
  if (!process.env.SMTP_FROM) {
    throw new Error("SMTP_FROM is not configured");
  }

  return process.env.SMTP_FROM;
};

// All notification copies are delivered to the owner inbox (default: deepakkandpal.tech@gmail.com)
const getNotifyInbox = () =>
  process.env.NOTIFY_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;

const escapeHtml = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const sendEmail = async ({ to, subject, html }) => {
  const mailer = getMailer();
  return mailer.sendMail({
    from: `"Resume Builder" <${getSender()}>`,
    to,
    subject,
    html,
  });
};

// POST /api/users/forgot-password
// Determines the user's provider:
//  - Google users → Firebase handles the reset email natively (client SDK)
//  - Custom email/password users → Firebase generates the link, Brevo sends it
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const firebaseUser = await auth.getUserByEmail(normalizedEmail);

    const providers = firebaseUser.providerData?.map((p) => p.providerId) || [];
    const isGoogle = providers.includes("google.com");

    if (isGoogle) {
      // Client uses this flag to trigger the Firebase SDK reset email.
      // Residual enumeration risk accepted: required for Google-user resets.
      return res.status(200).json({
        message:
          "If an account with that email exists, a reset link has been sent.",
        provider: "google",
      });
    }

    // Custom email/password user → generate link via Firebase Admin, send via Brevo
    const resetLink = await auth.generatePasswordResetLink(normalizedEmail);
    const targetUser = escapeHtml(normalizedEmail);

    await sendEmail({
      to: normalizedEmail,
      subject: `Password reset for ${normalizedEmail}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="margin-bottom:8px;color:#1f2937">Reset your password</h2>
          <p style="color:#6b7280;margin-bottom:8px">
            A password reset was requested for the account:
          </p>
          <p style="color:#1f2937;font-weight:600;margin-bottom:16px">${targetUser}</p>
          <p style="color:#6b7280;margin-bottom:24px">
            Click the button below — this link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetLink}"
             style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 28px;
                    border-radius:8px;text-decoration:none;font-weight:600">
            Reset password
          </a>
          <p style="margin-top:24px;font-size:13px;color:#9ca3af">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("forgotPassword error:", error.message);
    if (error.code === "auth/user-not-found") {
      return res.status(200).json({
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

// POST /api/users/send-verification
// Generates an email verification link and sends it via Brevo (custom email).
// Response is uniform regardless of account existence/verification state
// to prevent email enumeration.
export const sendVerification = async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) {
    return res.status(400).json({ message: "Email is required." });
  }

  const GENERIC_MESSAGE =
    "If an account with that email exists and is unverified, a verification link has been sent.";

  try {
    const normalizedEmail = email.trim().toLowerCase();

    let firebaseUser = null;
    try {
      firebaseUser = await auth.getUserByEmail(normalizedEmail);
    } catch (err) {
      if (err.code !== "auth/user-not-found") throw err;
    }

    if (firebaseUser && !firebaseUser.emailVerified) {
      const verifyLink = await auth.generateEmailVerificationLink(
        normalizedEmail,
        { url: frontendUrl() },
      );
      const targetUser = escapeHtml(normalizedEmail);

      await sendEmail({
        to: normalizedEmail,
        subject: `Verify email for ${normalizedEmail}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="margin-bottom:8px;color:#1f2937">Verify your email</h2>
            <p style="color:#6b7280;margin-bottom:8px">
              A new account was created for:
            </p>
            <p style="color:#1f2937;font-weight:600;margin-bottom:16px">${targetUser}</p>
            <p style="color:#6b7280;margin-bottom:24px">
              Please verify this email address to activate the account.
            </p>
            <a href="${verifyLink}"
               style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 28px;
                      border-radius:8px;text-decoration:none;font-weight:600">
              Verify email
            </a>
            <p style="margin-top:24px;font-size:13px;color:#9ca3af">
              If you didn't create this account, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    }

    return res.status(200).json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("sendVerification error:", error.message);
    return res.status(200).json({ message: GENERIC_MESSAGE });
  }
};

// POST /api/users/send-login-notification
// Sends a login success notification copy to the owner's notify inbox.
// Protected route — user input is HTML-escaped before interpolation.
export const sendLoginNotification = async (req, res) => {
  const { email, name, via } = req.body;
  if (!email?.trim()) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const safeEmail = escapeHtml(email.trim().toLowerCase());
    const safeName = escapeHtml(name || "—");
    const safeVia = escapeHtml(via || "email/password");

    await sendEmail({
      to: getNotifyInbox(),
      subject: `Login success: ${safeEmail}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="margin-bottom:8px;color:#1f2937">Login Success</h2>
          <p style="color:#6b7280;margin-bottom:8px">
            A user just logged into Resume Builder:
          </p>
          <p style="color:#1f2937;font-weight:600;margin-bottom:4px">${safeName}</p>
          <p style="color:#1f2937;font-weight:600;margin-bottom:16px">${safeEmail}</p>
          <p style="color:#6b7280;font-size:13px">
            Method: <strong>${safeVia}</strong>
          </p>
        </div>
      `,
    });

    return res.status(200).json({ message: "Notification sent." });
  } catch (error) {
    console.error("sendLoginNotification error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};
