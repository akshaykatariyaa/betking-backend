const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = async (req, res) => {
  const { transaction_id, mb_amount, status, customer_id } = req.body;

  if (status === '2') { // 2 = Processed (successful payment)
    try {
      await pool.query(
        'INSERT INTO wallets (user_id, balance) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET balance = wallets.balance + $2',
        [customer_id || 'unknown', parseFloat(mb_amount)]
      );
      console.log(`Payment of ${mb_amount} INR processed for transaction ${transaction_id}`);
    } catch (err) {
      console.error('Database update error:', err.message);
    }
  } else {
    console.log(`Payment status: ${status} for transaction ${transaction_id}`);
  }
  res.sendStatus(200); // Acknowledge Skrill
};