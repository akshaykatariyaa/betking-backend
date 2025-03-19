const { Pool } = require('pg');
const Stripe = require('stripe');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'your-secret-key-here');

module.exports = async (req, res) => {
  const { session_id } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid') {
      const { userId, amount } = session.metadata;
      await pool.query(
        'INSERT INTO wallets (user_id, balance) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET balance = wallets.balance + $2',
        [userId, amount / 100] // Convert back from paise to INR
      );
      res.status(200).send('Payment successful! Funds added.');
    } else {
      res.status(400).send('Payment not completed.');
    }
  } catch (error) {
    console.error('Stripe success error:', error.message);
    res.status(500).send('Error verifying payment');
  }
};