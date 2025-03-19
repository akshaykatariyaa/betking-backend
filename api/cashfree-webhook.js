const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = async (req, res) => {
  const { order_id, order_amount, payment_status, customer_id } = req.body.data.order;

  if (payment_status === 'SUCCESS') {
    try {
      await pool.query(
        'INSERT INTO wallets (user_id, balance) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET balance = wallets.balance + $2',
        [customer_id, order_amount]
      );
      console.log(`Payment of ${order_amount} INR processed for order ${order_id}`);
    } catch (err) {
      console.error('Database update error:', err.message);
    }
  }
  res.sendStatus(200); // Acknowledge webhook
};