export const assignDelivery = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Delivery assigned to agent"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};