export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        stripeConnected: req.user.stripeConnected,
        stripeAccountId: req.user.stripeAccountId,
      },
    });
  } catch (error) {
    next(error);
  }
};