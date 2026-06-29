import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import getMailer from "../config/mailer.js";

// Token TTL — 1 hour
const TOKEN_TTL_MS = 60 * 60 * 1000;

// ── POST /api/users/forgot-password ────────────────────────────────────────
// Accepts an email address, generates a secure reset token, stores its
// SHA-256 hash in the DB (never the raw token), and emails a reset link.
//
// Always responds with 200 even when the email is not found — this prevents
// user enumeration attacks.
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (user) {
      // Generate a cryptographically random token
      const rawToken = crypto.randomBytes(32).toString("hex");
      // Store only the hash so a DB leak can't be used to reset passwords
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

      user.resetPasswordToken   = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + TOKEN_TTL_MS);
      await user.save();

      // Build the reset link pointing at the frontend
      const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

      // Send the email (fire-and-forget — don't block the response)
      const mailer = getMailer();
      const from   = process.env.SMTP_FROM || process.env.SMTP_USER;

      mailer.sendMail({
        from: `"Resume Builder" <${from}>`,
        to:   user.email,
        subject: "Reset your password",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="margin-bottom:8px;color:#1f2937">Reset your password</h2>
            <p style="color:#6b7280;margin-bottom:24px">
              We received a request to reset the password for your Resume Builder account.
              Click the button below — this link expires in <strong>1 hour</strong>.
            </p>
            <a href="${resetUrl}"
               style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 28px;
                      border-radius:8px;text-decoration:none;font-weight:600">
              Reset password
            </a>
            <p style="margin-top:24px;font-size:13px;color:#9ca3af">
              If you didn't request this, you can safely ignore this email.
              Your password won't change until you click the link above.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
            <p style="font-size:12px;color:#d1d5db">
              Or copy this link: <br/>
              <a href="${resetUrl}" style="color:#4f46e5;word-break:break-all">${resetUrl}</a>
            </p>
          </div>
        `,
      }).catch((err) => {
        console.error("Password reset email failed:", err.message);
      });
    }

    // Always return 200 — never reveal whether the email exists
    return res.status(200).json({
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// ── POST /api/users/reset-password ─────────────────────────────────────────
// Verifies the raw token against the stored hash, checks expiry, and
// updates the user's password.
export const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email || !password) {
    return res.status(400).json({ message: "Token, email and new password are required." });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  try {
    // Hash the incoming raw token to compare with the DB value
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }, // not expired
    });

    if (!user) {
      return res.status(400).json({
        message: "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    // Update password and clear the reset token fields
    user.password             = await bcrypt.hash(password, 10);
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};
