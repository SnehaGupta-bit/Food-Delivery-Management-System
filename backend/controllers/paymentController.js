import crypto from "crypto";

// Razorpay instance - will use env vars if available
let razorpayInstance = null;

try {
  const { default: Razorpay } = await import("razorpay");
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
  }
} catch (e) {
  console.log("Razorpay not configured - payment features disabled");
}

export const createPaymentOrder = async (req, res) => {
  try {
    if (!razorpayInstance) {
      return res.status(503).json({ message: "Payment service not configured" });
    }

    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Payment creation failed" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!process.env.RAZORPAY_SECRET) {
      return res.status(503).json({ message: "Payment verification not configured" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      res.json({ verified: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ verified: false, message: "Payment verification failed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Payment verification error" });
  }
};