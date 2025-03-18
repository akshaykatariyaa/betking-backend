const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = async (req, res) => {
  const { userId, matchId, poolId, team, amount } = req.body;

  try {
    const { rows: [wallet] } = await pool.query('SELECT balance FROM wallets WHERE user_id = $1', [userId]);
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance', redirect: '/payment' });
    }

    await pool.query('UPDATE wallets SET balance = balance - $1 WHERE user_id = $2', [amount, userId]);
    await pool.query('UPDATE pools SET bets = bets + 1 WHERE id = $1', [poolId]);
    await pool.query('INSERT INTO bets (user_id, match_id, pool_id, team, amount) VALUES ($1, $2, $3, $4, $5)', [userId, matchId, poolId, team, amount]);

    res.status(200).json({ message: 'Bet placed! Balance updated.' });
  } catch (err) {
    console.error('Bet error:', err.message);
    res.status(500).json({ error: 'Failed to place bet', details: err.message });
  }
};