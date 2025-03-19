module.exports = async (req, res) => {
  res.status(200).send('Payment initiated! Redirecting...');
  // Note: Actual balance update happens via webhook
};