const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = async (req, res) => {
  const matchId = req.url.split('/').pop();
  if (!matchId) return res.status(400).json({ error: 'matchId is required' });

  try {
    let { rows: pools } = await pool.query('SELECT * FROM pools WHERE match_id = $1 ORDER BY size, amount', [matchId]);
    if (pools.length === 0) {
      const sizes = [2, 4, 6, 8, 10];
      const amounts = [200, 500, 1000, 2500, 5000, 9999];
      for (const size of sizes) {
        for (const amount of amounts) {
          await pool.query(
            'INSERT INTO pools (match_id, size, amount, status, bets) VALUES ($1, $2, $3, $4, $5)',
            [matchId, size, amount, 'open', 0]
          );
        }
      }
      pools = (await pool.query('SELECT * FROM pools WHERE match_id = $1 ORDER BY size, amount', [matchId])).rows;
    }
    res.status(200).json(pools);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch pools', details: err.message });
  }
};