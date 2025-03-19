const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = async (req, res) => {
  const { userId, matchId, poolId, team, amount } = req.body;

  // Validate input
  if (!userId || !matchId || !poolId || !team || !amount || amount <= 0) {
    console.error('Invalid input:', req.body);
    return res.status(400).json({ error: 'Missing or invalid parameters' });
  }

  let client;
  try {
    client = await pool.connect();
    console.log('Database connected for user:', userId);

    await client.query('BEGIN');
    console.log('Transaction started');

    // Fetch wallet balance
    const { rows: [wallet] } = await client.query('SELECT balance FROM wallets WHERE user_id = $1', [userId]);
    console.log('Wallet:', wallet);
    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Deduct amount from wallet
    await client.query('UPDATE wallets SET balance = balance - $1 WHERE user_id = $2', [amount, userId]);
    console.log('Wallet updated, deducted:', amount);

    // Increment pool bets
    await client.query('UPDATE pools SET bets = bets + 1 WHERE id = $1', [poolId]);
    console.log('Pool bets incremented for pool:', poolId);

    // Insert bet
    await client.query(
      'INSERT INTO bets (user_id, match_id, pool_id, team, amount) VALUES ($1, $2, $3, $4, $5)',
      [userId, matchId, poolId, team, amount]
    );
    console.log('Bet inserted');

    // Fetch updated pool data
    const { rows: [pool] } = await client.query('SELECT size, amount, bets FROM pools WHERE id = $1', [poolId]);
    console.log('Pool data:', pool);
    if (!pool) throw new Error('Pool not found');

    // Check if pool is full
    if (pool.bets === pool.size) { // Use updated bets value
      const { rows: bets } = await client.query(
        'SELECT user_id FROM bets WHERE pool_id = $1 ORDER BY RANDOM() LIMIT 1',
        [poolId]
      );
      console.log('Random winner selected:', bets[0]);
      const winnerId = bets[0].user_id;
      const prize = pool.amount * pool.size * 0.9;
      console.log('Prize calculated:', prize);

      await client.query('UPDATE wallets SET balance = balance + $1 WHERE user_id = $2', [prize, winnerId]);
      console.log('Prize awarded to:', winnerId);

      await client.query('UPDATE pools SET status = $1 WHERE id = $2', ['closed', poolId]);
      console.log('Pool closed');
    }

    await client.query('COMMIT');
    console.log('Transaction committed');
    res.status(200).json({ message: 'Prediction placed!' });
  } catch (err) {
    console.error('Bet transaction error:', err.message, err.stack);
    if (client) await client.query('ROLLBACK');
    if (err.message === 'Insufficient balance') {
      return res.status(400).json({ error: 'Insufficient balance', redirect: '/payment' });
    }
    res.status(500).json({ error: 'Failed to place prediction', details: err.message });
  } finally {
    if (client) client.release();
    console.log('Database client released');
  }
};