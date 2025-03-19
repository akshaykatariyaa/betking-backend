module.exports = async (req, res) => {
    res.redirect(301, 'http://localhost:8081/failure'); // Redirect to app (adjust for Expo)
  };