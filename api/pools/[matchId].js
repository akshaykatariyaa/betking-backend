const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  console.log('Full request:', { method: req.method, url: req.url, params: req.params, query: req.query });
  const matchId = req.url.split('/').pop() || req.params?.matchId || req.query?.matchId;

  console.log('Extracted matchId:', matchId);
  if (!matchId) {
    return res.status(400).json({ error: 'matchId is required' });
  }

  try {
    console.log(`Querying pools for match_id: ${matchId}`);
    let { rows: pools } = await pool.query('SELECT * FROM pools WHERE match_id = $1', [matchId]);
    console.log('Fetched pools:', pools);

    if (pools.length === 0) {
      console.log('No pools found, creating defaults...');
      const defaultSizes = [2, 4, 6, 8, 10];
      for (const size of defaultSizes) {
        console.log(`Inserting: match_id=${matchId}, size=${size}`);
        await pool.query(
          'INSERT INTO pools (match_id, size, status, bets) VALUES ($1, $2, $3, $4)',
          [matchId, size, 'open', 0]
        );
      }
      const { rows: newPools } = await pool.query('SELECT * FROM pools WHERE match_id = $1', [matchId]);
      console.log('New pools:', newPools);
      pools = newPools;
    }

    res.status(200).json(pools);
  } catch (err) {
    console.error('Error in pools:', err.message);
    res.status(500).json({ error: 'Failed to fetch or create pools', details: err.message });
  }
};