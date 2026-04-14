import razorpayInstance from "../config/razorpay.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json(order);

  } catch (error) {
    res.status(500).json({
      message: "Payment creation failed"
    });
  }
};