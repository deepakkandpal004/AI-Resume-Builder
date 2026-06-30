import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";

// Helper to initialize Razorpay. Throws error if keys are missing in env.
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are missing in .env");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// POST /api/payments/create-order
// Creates a new Razorpay Order (amount: ₹299 = 29900 paise)
export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const rzp = getRazorpayInstance();

    // Standard amount is ₹299 = 29900 paise
    const amount = 29900; 
    const currency = "INR";
    const receipt = `receipt_order_${Date.now()}`;

    const order = await rzp.orders.create({
      amount,
      currency,
      receipt,
      payment_capture: 1, // Automatically capture payment on authorization
    });

    if (!order) {
      throw new Error("Razorpay order creation failed");
    }

    // Associate this order with the user
    user.razorpayOrderId = order.id;
    await user.save();

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Create Razorpay Order error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/payments/verify-payment
// Verifies signature using HMAC-SHA256 and activates premium subscription.
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.userId;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing required payment details" });
    }

    // Verify HMAC-SHA256 signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Razorpay secret key is not configured" });
    }

    const signBody = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signBody)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (isSignatureValid) {
      // Find and update the user's tier to premium
      const user = await User.findByIdAndUpdate(
        userId,
        {
          subscriptionTier: "premium",
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`User ${userId} successfully upgraded to premium via Razorpay. Order: ${razorpay_order_id}`);
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully. Your account has been upgraded to Premium!",
        user: {
          name: user.name,
          email: user.email,
          subscriptionTier: user.subscriptionTier,
        },
      });
    } else {
      console.warn(`Invalid Razorpay signature for user ${userId}, Order: ${razorpay_order_id}`);
      return res.status(400).json({
        success: false,
        message: "Invalid signature verification. Payment authentication failed.",
      });
    }
  } catch (error) {
    console.error("Verify Razorpay Payment error:", error);
    return res.status(500).json({ message: error.message });
  }
};
