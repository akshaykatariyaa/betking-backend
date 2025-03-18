const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const seedMatches = async () => {
    const realMatches = [
        { id: 1, name: 'KKR vs RCB', team1: 'KKR', team2: 'RCB', date: '2025-03-22T14:00:00Z' },
        { id: 2, name: 'SRH vs RR', team1: 'SRH', team2: 'RR', date: '2025-03-23T10:00:00Z' },
        { id: 3, name: 'CSK vs MI', team1: 'CSK', team2: 'MI', date: '2025-03-23T14:00:00Z' },
        { id: 4, name: 'DC vs LSG', team1: 'DC', team2: 'LSG', date: '2025-03-24T14:00:00Z' },
        { id: 5, name: 'GT vs PBKS', team1: 'GT', team2: 'PBKS', date: '2025-03-25T14:00:00Z' },
        { id: 6, name: 'RR vs KKR', team1: 'RR', team2: 'KKR', date: '2025-03-26T14:00:00Z' },
        { id: 7, name: 'SRH vs LSG', team1: 'SRH', team2: 'LSG', date: '2025-03-27T14:00:00Z' },
        { id: 8, name: 'CSK vs RCB', team1: 'CSK', team2: 'RCB', date: '2025-03-28T14:00:00Z' },
        { id: 9, name: 'GT vs MI', team1: 'GT', team2: 'MI', date: '2025-03-29T14:00:00Z' },
        { id: 10, name: 'DC vs SRH', team1: 'DC', team2: 'SRH', date: '2025-03-30T10:00:00Z' },
        { id: 11, name: 'PBKS vs CSK', team1: 'PBKS', team2: 'CSK', date: '2025-03-30T14:00:00Z' },
        { id: 12, name: 'RCB vs RR', team1: 'RCB', team2: 'RR', date: '2025-03-31T14:00:00Z' },
        { id: 13, name: 'KKR vs PBKS', team1: 'KKR', team2: 'PBKS', date: '2025-04-01T14:00:00Z' },
        { id: 14, name: 'CSK vs RR', team1: 'CSK', team2: 'RR', date: '2025-04-02T14:00:00Z' },
        { id: 15, name: 'RCB vs PBKS', team1: 'RCB', team2: 'PBKS', date: '2025-04-03T14:00:00Z' },
        { id: 16, name: 'KKR vs CSK', team1: 'KKR', team2: 'CSK', date: '2025-04-04T14:00:00Z' },
        { id: 17, name: 'RR vs PBKS', team1: 'RR', team2: 'PBKS', date: '2025-04-05T10:00:00Z' },
        { id: 18, name: 'RCB vs KKR', team1: 'RCB', team2: 'KKR', date: '2025-04-05T14:00:00Z' },
        { id: 19, name: 'CSK vs PBKS', team1: 'CSK', team2: 'PBKS', date: '2025-04-06T10:00:00Z' },
        { id: 20, name: 'RR vs RCB', team1: 'RR', team2: 'RCB', date: '2025-04-06T14:00:00Z' },
        { id: 21, name: 'MI vs SRH', team1: 'MI', team2: 'SRH', date: '2025-04-07T14:00:00Z' },
        { id: 22, name: 'LSG vs GT', team1: 'LSG', team2: 'GT', date: '2025-04-08T14:00:00Z' },
        { id: 23, name: 'DC vs MI', team1: 'DC', team2: 'MI', date: '2025-04-09T14:00:00Z' },
        { id: 24, name: 'SRH vs GT', team1: 'SRH', team2: 'GT', date: '2025-04-10T14:00:00Z' },
        { id: 25, name: 'LSG vs DC', team1: 'LSG', team2: 'DC', date: '2025-04-11T14:00:00Z' },
        { id: 26, name: 'MI vs GT', team1: 'MI', team2: 'GT', date: '2025-04-12T10:00:00Z' },
        { id: 27, name: 'SRH vs DC', team1: 'SRH', team2: 'DC', date: '2025-04-12T14:00:00Z' },
        { id: 28, name: 'LSG vs MI', team1: 'LSG', team2: 'MI', date: '2025-04-13T10:00:00Z' },
        { id: 29, name: 'GT vs DC', team1: 'GT', team2: 'DC', date: '2025-04-13T14:00:00Z' },
        { id: 30, name: 'SRH vs LSG', team1: 'SRH', team2: 'LSG', date: '2025-04-14T14:00:00Z' },
        { id: 31, name: 'MI vs KKR', team1: 'MI', team2: 'KKR', date: '2025-04-15T14:00:00Z' },
        { id: 32, name: 'SRH vs CSK', team1: 'SRH', team2: 'CSK', date: '2025-04-16T14:00:00Z' },
        { id: 33, name: 'DC vs RR', team1: 'DC', team2: 'RR', date: '2025-04-17T14:00:00Z' },
        { id: 34, name: 'LSG vs PBKS', team1: 'LSG', team2: 'PBKS', date: '2025-04-18T14:00:00Z' },
        { id: 35, name: 'GT vs RCB', team1: 'GT', team2: 'RCB', date: '2025-04-19T10:00:00Z' },
        { id: 36, name: 'KKR vs MI', team1: 'KKR', team2: 'MI', date: '2025-04-19T14:00:00Z' },
        { id: 37, name: 'CSK vs SRH', team1: 'CSK', team2: 'SRH', date: '2025-04-20T10:00:00Z' },
        { id: 38, name: 'RR vs DC', team1: 'RR', team2: 'DC', date: '2025-04-20T14:00:00Z' },
        { id: 39, name: 'PBKS vs LSG', team1: 'PBKS', team2: 'LSG', date: '2025-04-21T14:00:00Z' },
        { id: 40, name: 'RCB vs GT', team1: 'RCB', team2: 'GT', date: '2025-04-22T14:00:00Z' },
        { id: 41, name: 'KKR vs SRH', team1: 'KKR', team2: 'SRH', date: '2025-04-23T14:00:00Z' },
        { id: 42, name: 'CSK vs DC', team1: 'CSK', team2: 'DC', date: '2025-04-24T14:00:00Z' },
        { id: 43, name: 'RR vs GT', team1: 'RR', team2: 'GT', date: '2025-04-25T14:00:00Z' },
        { id: 44, name: 'PBKS vs MI', team1: 'PBKS', team2: 'MI', date: '2025-04-26T10:00:00Z' },
        { id: 45, name: 'RCB vs LSG', team1: 'RCB', team2: 'LSG', date: '2025-04-26T14:00:00Z' },
        { id: 46, name: 'MI vs RR', team1: 'MI', team2: 'RR', date: '2025-04-27T10:00:00Z' },
        { id: 47, name: 'SRH vs PBKS', team1: 'SRH', team2: 'PBKS', date: '2025-04-27T14:00:00Z' },
        { id: 48, name: 'DC vs KKR', team1: 'DC', team2: 'KKR', date: '2025-04-28T14:00:00Z' },
        { id: 49, name: 'GT vs CSK', team1: 'GT', team2: 'CSK', date: '2025-04-29T14:00:00Z' },
        { id: 50, name: 'LSG vs RCB', team1: 'LSG', team2: 'RCB', date: '2025-04-30T14:00:00Z' },
        { id: 51, name: 'KKR vs GT', team1: 'KKR', team2: 'GT', date: '2025-05-01T14:00:00Z' },
        { id: 52, name: 'CSK vs LSG', team1: 'CSK', team2: 'LSG', date: '2025-05-02T14:00:00Z' },
        { id: 53, name: 'RR vs MI', team1: 'RR', team2: 'MI', date: '2025-05-03T10:00:00Z' },
        { id: 54, name: 'PBKS vs DC', team1: 'PBKS', team2: 'DC', date: '2025-05-03T14:00:00Z' },
        { id: 55, name: 'RCB vs SRH', team1: 'RCB', team2: 'SRH', date: '2025-05-04T10:00:00Z' },
        { id: 56, name: 'MI vs PBKS', team1: 'MI', team2: 'PBKS', date: '2025-05-04T14:00:00Z' },
        { id: 57, name: 'SRH vs RCB', team1: 'SRH', team2: 'RCB', date: '2025-05-05T14:00:00Z' },
        { id: 58, name: 'DC vs CSK', team1: 'DC', team2: 'CSK', date: '2025-05-06T14:00:00Z' },
        { id: 59, name: 'GT vs KKR', team1: 'GT', team2: 'KKR', date: '2025-05-07T14:00:00Z' },
        { id: 60, name: 'LSG vs RR', team1: 'LSG', team2: 'RR', date: '2025-05-08T14:00:00Z' },
        { id: 61, name: 'KKR vs LSG', team1: 'KKR', team2: 'LSG', date: '2025-05-09T14:00:00Z' },
        { id: 62, name: 'CSK vs GT', team1: 'CSK', team2: 'GT', date: '2025-05-10T10:00:00Z' },
        { id: 63, name: 'RR vs SRH', team1: 'RR', team2: 'SRH', date: '2025-05-10T14:00:00Z' },
        { id: 64, name: 'PBKS vs RCB', team1: 'PBKS', team2: 'RCB', date: '2025-05-11T10:00:00Z' },
        { id: 65, name: 'RCB vs DC', team1: 'RCB', team2: 'DC', date: '2025-05-11T14:00:00Z' },
        { id: 66, name: 'MI vs LSG', team1: 'MI', team2: 'LSG', date: '2025-05-12T14:00:00Z' },
        { id: 67, name: 'SRH vs KKR', team1: 'SRH', team2: 'KKR', date: '2025-05-13T14:00:00Z' },
        { id: 68, name: 'DC vs PBKS', team1: 'DC', team2: 'PBKS', date: '2025-05-14T14:00:00Z' },
        { id: 69, name: 'GT vs RR', team1: 'GT', team2: 'RR', date: '2025-05-15T14:00:00Z' },
        { id: 70, name: 'LSG vs SRH', team1: 'LSG', team2: 'SRH', date: '2025-05-18T14:00:00Z' }
      ];
  
    const count = await pool.query('SELECT COUNT(*) FROM matches');
    if (count.rows[0].count === '0') {
      for (const match of realMatches) {
        await pool.query(
          'INSERT INTO matches (id, name, team1, team2, date) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
          [match.id, match.name, match.team1, match.team2, match.date]
        );
      }
      console.log('Seeded 70 IPL 2025 matches');
    }
  };

  module.exports = async (req, res) => {
    try {
      await seedMatches();
      const result = await pool.query('SELECT * FROM matches ORDER BY date');
      res.json(result.rows);
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  };