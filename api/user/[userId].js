const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  const userId = req.query.userId;
  try {
    const bets = await pool.query(
      'SELECT b.*, m.name, p.size FROM bets b JOIN pools p ON b.pool_id = p.id JOIN matches m ON p.match_id = m.id WHERE b.user_id = $1',
      [userId]
    );
    const payouts = await pool.query(
      'SELECT p.*, m.name FROM payouts p JOIN pools po ON p.pool_id = po.id JOIN matches m ON po.match_id = m.id WHERE p.user_id = $1',
      [userId]
    );
    res.status(200).json({ bets: bets.rows, winnings: 0 }); // Update with real logic later
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};