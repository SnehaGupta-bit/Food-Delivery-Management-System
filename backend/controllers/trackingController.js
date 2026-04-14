export const updateLocation = async (req, res) => {
  try {
    const { agentId, lat, lng } = req.body;

    res.status(200).json({
      success: true,
      message: "Location updated"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};