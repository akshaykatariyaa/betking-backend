const { Pool } = require('pg');
const crypto = require('crypto');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = async (req, res) => {
  const { userId, amount, txnid, email, firstname, phone } = req.body;

  const merchantKey = 'YOUR_PAYU_MERCHANT_KEY'; // From PayU dashboard
  const salt = 'YOUR_PAYU_SALT'; // From PayU dashboard
  const payuUrl = 'https://test.payu.in/_payment'; // Test mode; use 'https://secure.payu.in/_payment' for live

  const hashString = `${merchantKey}|${txnid}|${amount}|PredictKing Payment|${firstname}|${email}||||||${salt}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  const payuData = {
    key: merchantKey,
    txnid,
    amount,
    productinfo: 'PredictKing Payment',
    firstname,
    email,
    phone,
    surl: 'https://cricket-backend-seven.vercel.app/api/payu-success', // Success URL
    furl: 'https://cricket-backend-seven.vercel.app/api/payu-failure', // Failure URL
    hash,
    service_provider: 'payu_paisa',
  };

  const formBody = Object.entries(payuData)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  res.status(200).json({ url: `${payuUrl}?${formBody}` });
};