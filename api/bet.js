const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = async (req, res) => {
  const { userId, matchId, poolId, team, amount } = req.body;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: [wallet] } = await client.query('SELECT balance FROM wallets WHERE user_id = $1', [userId]);
      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      await client.query('UPDATE wallets SET balance = balance - $1 WHERE user_id = $2', [amount, userId]);
      await client.query('UPDATE pools SET bets = bets + 1 WHERE id = $1', [poolId]);
      await client.query('INSERT INTO bets (user_id, match_id, pool_id, team, amount) VALUES ($1, $2, $3, $4, $5)', [userId, matchId, poolId, team, amount]);

      const { rows: [pool] } = await client.query('SELECT size, amount FROM pools WHERE id = $1', [poolId]);
      if (pool.bets + 1 === pool.size) { // Check after increment
        const { rows: bets } = await client.query('SELECT user_id FROM bets WHERE pool_id = $1 ORDER BY RANDOM() LIMIT 1', [poolId]);
        const winnerId = bets[0].user_id;
        const prize = pool.amount * pool.size * 0.9;
        await client.query('UPDATE wallets SET balance = balance + $1 WHERE user_id = $2', [prize, winnerId]);
        await client.query('UPDATE pools SET status = $1 WHERE id = $2', ['closed', poolId]);
      }

      await client.query('COMMIT');
      res.status(200).json({ message: 'Prediction placed!' });
    } catch (err) {
      await client.query('ROLLBACK');
      if (err.message === 'Insufficient balance') {
        return res.status(400).json({ error: 'Insufficient balance', redirect: '/payment' });
      }
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Bet error:', err.message);
    res.status(500).json({ error: 'Failed to place prediction', details: err.message });
  }
};