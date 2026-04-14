export const getDashboardStats = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Admin dashboard data"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};