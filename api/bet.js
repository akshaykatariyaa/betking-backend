const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = async (req, res) => {
  const { userId, matchId, poolId, team, amount } = req.body;

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

    const { rows } = await client.query('SELECT balance FROM wallets WHERE user_id = $1', [userId]);
    const wallet = rows[0];
    console.log('Wallet query result:', rows);

    if (!wallet) {
      console.log('No wallet found for user:', userId);
      throw new Error('Insufficient balance');
    }
    if (wallet.balance < amount) {
      console.log('Insufficient funds:', { balance: wallet.balance, required: amount });
      throw new Error('Insufficient balance');
    }

    await client.query('UPDATE wallets SET balance = balance - $1 WHERE user_id = $2', [amount, userId]);
    await client.query('UPDATE pools SET bets = bets + 1 WHERE id = $1', [poolId]);
    await client.query(
      'INSERT INTO bets (user_id, match_id, pool_id, team, amount) VALUES ($1, $2, $3, $4, $5)',
      [userId, matchId, poolId, team, amount]
    );

    const { rows: [poolData] } = await client.query('SELECT size, amount, bets FROM pools WHERE id = $1', [poolId]);
    if (!poolData) throw new Error('Pool not found');

    if (poolData.bets === poolData.size) {
      const { rows: bets } = await client.query('SELECT user_id FROM bets WHERE pool_id = $1 ORDER BY RANDOM() LIMIT 1', [
        poolId,
      ]);
      const winnerId = bets[0].user_id;
      const prize = poolData.amount * poolData.size * 0.9;
      await client.query('UPDATE wallets SET balance = balance + $1 WHERE user_id = $2', [prize, winnerId]);
      await client.query('UPDATE pools SET status = $1 WHERE id = $2', ['closed', poolId]);
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Prediction placed!' });
  } catch (err) {
    console.error('Bet transaction error:', err.message, err.stack);
    if (client) await client.query('ROLLBACK');
    if (err.message === 'Insufficient balance') {
      return res.status(400).json({ error: 'Insufficient balance', redirect: 'PaymentScreen' }); // Changed to 'PaymentScreen'
    }
    res.status(500).json({ error: 'Failed to place prediction', details: err.message });
  } finally {
    if (client) client.release();
    console.log('Database client released');
  }
};