const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = async (req, res) => {
  const userId = req.url.split('/').pop();

  try {
    const { rows: bets } = await pool.query(`
      SELECT b.id, b.match_id, b.pool_id, b.team, b.amount, m.name, p.size as pool_size, p.status as pool_status
      FROM bets b
      JOIN matches m ON b.match_id = m.id
      JOIN pools p ON b.pool_id = p.id
      WHERE b.user_id = $1
    `, [userId]);

    // Mock status for now (replace with real logic later)
    const predictions = bets.map(bet => ({
      ...bet,
      status: bet.pool_status === 'closed' ? (Math.random() > 0.5 ? 'won' : 'lost') : 'pending'
    }));

    res.status(200).json({ bets: predictions });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user data', details: err.message });
  }
};