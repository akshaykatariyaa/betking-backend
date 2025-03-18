const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  console.log('Request query:', req.query); // Debug full query
  const { matchId } = req.query;
  console.log('Extracted matchId:', matchId); // Confirm matchId

  if (!matchId) {
    return res.status(400).json({ error: 'matchId is required' });
  }

  try {
    let { rows: pools } = await pool.query('SELECT * FROM pools WHERE match_id = $1', [matchId]);

    if (pools.length === 0) {
      const defaultSizes = [2, 4, 6, 8, 10];
      for (const size of defaultSizes) {
        await pool.query(
          'INSERT INTO pools (match_id, size, status, bets) VALUES ($1, $2, $3, $4)',
          [matchId, size, 'open', 0]
        );
      }
      const { rows: newPools } = await pool.query('SELECT * FROM pools WHERE match_id = $1', [matchId]);
      pools = newPools;
    }

    res.status(200).json(pools);
  } catch (err) {
    console.error('Error in pools:', err.message);
    res.status(500).json({ error: 'Failed to fetch pools', details: err.message });
  }
};