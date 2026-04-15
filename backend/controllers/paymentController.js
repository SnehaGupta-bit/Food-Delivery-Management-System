import razorpayInstance from "../config/razorpay.js";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import crypto from "crypto";

export const createPaymentOrder = async (req, res) => {
  try {
    if (!razorpayInstance) {
      return res.status(503).json({ message: "Payment service not configured" });
    }

    const { orderId, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${orderId}_${Date.now()}`,
      notes: {
        orderId: orderId
      }
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // Create payment record
    const payment = await Payment.create({
      order: orderId,
      razorpayOrderId: razorpayOrder.id,
      status: "Pending"
    });

    res.status(200).json({
      success: true,
      razorpayOrder,
      payment
    });

  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).json({
      message: "Payment creation failed",
      error: error.message
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature,
      orderId 
    } = req.body;

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpaySignature;

    if (isAuthentic) {
      // Update payment record
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        {
          razorpayPaymentId,
          razorpaySignature,
          status: "Completed"
        }
      );

      // Update order payment status
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "Paid",
        orderStatus: "Placed"
      });

      res.status(200).json({
        success: true,
        message: "Payment verified successfully"
      });
    } else {
      // Update payment as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: "Failed" }
      );

      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "Failed"
      });

      res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      message: "Payment verification failed",
      error: error.message
    });
  }
};