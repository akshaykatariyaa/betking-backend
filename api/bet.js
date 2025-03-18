const { Pool } = require('pg');

const VALID_AMOUNTS = [200, 500, 1000, 2500, 5000, 9999];
const COMMISSION_RATE = 0.25;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  const { userId, matchId, team, poolSize, amount, accountNumber, ifsc } = req.body;

  if (!VALID_AMOUNTS.includes(amount)) {
    return res.status(400).json({ error: 'Invalid stake amount' });
  }
  if (poolSize < 2 || poolSize > 10) {
    return res.status(400).json({ error: 'Pool size must be between 2 and 10' });
  }

  try {
    await pool.query(
      'INSERT INTO users (id, account_number, ifsc) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET account_number = $2, ifsc = $3',
      [userId, accountNumber, ifsc]
    );

    const poolResult = await pool.query(
      'SELECT id FROM pools WHERE match_id = $1 AND size = $2 AND status = $3 AND (SELECT COUNT(*) FROM bets WHERE pool_id = pools.id) < $2 LIMIT 1',
      [matchId, poolSize, 'open']
    );

    let poolId;
    if (poolResult.rows.length === 0) {
      const newPool = await pool.query(
        'INSERT INTO pools (match_id, size) VALUES ($1, $2) RETURNING id',
        [matchId, poolSize]
      );
      poolId = newPool.rows[0].id;
    } else {
      poolId = poolResult.rows[0].id;
    }

    await pool.query(
      'INSERT INTO bets (user_id, pool_id, team, amount) VALUES ($1, $2, $3, $4)',
      [userId, poolId, team, amount]
    );

    const bets = await pool.query('SELECT * FROM bets WHERE pool_id = $1', [poolId]);
    if (bets.rows.length === poolSize) {
      const winners = bets.rows.filter(b => b.team === bets.rows[0].team);
      const totalStake = bets.rows.reduce((sum, b) => sum + b.amount, 0);
      const commission = totalStake * COMMISSION_RATE;
      const payout = totalStake - commission;
      const winnerShare = winners.length > 0 ? payout / winners.length : 0;

      await pool.query('UPDATE pools SET status = $1 WHERE id = $2', ['completed', poolId]);
      for (const winner of winners) {
        await pool.query(
          'INSERT INTO payouts (pool_id, user_id, amount, status) VALUES ($1, $2, $3, $4)',
          [poolId, winner.user_id, winnerShare, 'pending']
        );
      }

      res.json({
        success: true,
        payout: winnerShare,
        note: `Pay ₹${amount} to [Your UPI/Bank]. Winnings (₹${winnerShare}) pending IMPS transfer!`
      });
    } else {
      res.json({
        success: true,
        message: `Pay ₹${amount} to [Your UPI/Bank]`,
        betsInPool: bets.rows.length,
        poolSize
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to place bet' });
  }
};