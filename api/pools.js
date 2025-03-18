const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  const matchId = req.query.matchId;
  try {
    const pools = await pool.query(
      'SELECT p.id, p.size, p.status, COUNT(b.id) as bets FROM pools p LEFT JOIN bets b ON p.id = b.pool_id WHERE p.match_id = $1 GROUP BY p.id',
      [matchId]
    );
    res.json(pools.rows);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch pools' });
  }
};