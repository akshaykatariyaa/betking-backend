import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  const { matchId } = req.query;

  try {
    // Fetch pools
    let { rows: pools } = await pool.query('SELECT * FROM pools WHERE match_id = $1', [matchId]);

    // If no pools, create defaults (2, 4, 6, 8, 10)
    if (pools.length === 0) {
      const defaultSizes = [2, 4, 6, 8, 10];
      for (const size of defaultSizes) {
        await pool.query(
          'INSERT INTO pools (match_id, size, status, bets) VALUES ($1, $2, $3, $4)',
          [matchId, size, 'open', 0]
        );
      }
      // Fetch newly created pools
      const { rows: newPools } = await pool.query('SELECT * FROM pools WHERE match_id = $1', [matchId]);
      pools = newPools;
    }

    res.status(200).json(pools);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pools' });
  }
}