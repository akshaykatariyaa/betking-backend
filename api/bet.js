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

    // Simulate winner logic (replace with real match result later)
    const { rows: [pool] } = await pool.query('SELECT size, amount FROM pools WHERE id = $1', [poolId]);
    if (pool.bets === pool.size) { // Pool full, pick winner
      const { rows: bets } = await pool.query('SELECT user_id FROM bets WHERE pool_id = $1 ORDER BY RANDOM() LIMIT 1', [poolId]); // Random winner for now
      const winnerId = bets[0].user_id;
      const prize = pool.amount * pool.size * 0.9; // 90% of pool as prize
      await pool.query('UPDATE wallets SET balance = balance + $1 WHERE user_id = $2', [prize, winnerId]);
      await pool.query('UPDATE pools SET status = $1 WHERE id = $2', ['closed', poolId]);
    }

    res.status(200).json({ message: 'Prediction placed!' });
  } catch (err) {
    console.error('Bet error:', err.message);
    res.status(500).json({ error: 'Failed to place prediction', details: err.message });
  }
};