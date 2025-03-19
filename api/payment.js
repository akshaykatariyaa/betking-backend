const { Pool } = require('pg');
const axios = require('axios');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = async (req, res) => {
  const { userId, amount, email, firstname, phone } = req.body;

  // Skrill credentials (replace with your own from Skrill Merchant Dashboard)
  const SKRILL_MERCHANT_EMAIL = 'yourmerchantemail@example.com'; // Your Skrill email
  const SKRILL_MERCHANT_ID = 'YOUR_MERCHANT_ID'; // From Skrill dashboard

  // Generate a unique transaction ID
  const txnid = `txn_${Date.now()}`;

  // Skrill payment parameters
  const skrillData = {
    pay_to_email: SKRILL_MERCHANT_EMAIL,
    amount: amount.toString(), // Amount in INR
    currency: 'INR',
    language: 'EN',
    prepare_only: '1', // Returns a session ID for redirection
    detail1_description: 'PredictKing Deposit',
    detail1_text: `Deposit for User ${userId}`,
    return_url: 'https://cricket-backend-seven.vercel.app/api/skrill-success', // Success callback
    cancel_url: 'https://cricket-backend-seven.vercel.app/api/skrill-failure', // Cancel callback
    status_url: 'https://cricket-backend-seven.vercel.app/api/skrill-callback', // Payment status webhook
    transaction_id: txnid,
    recipient_description: 'Predict King',
    customer_email: email,
    customer_firstname: firstname,
    customer_phone: phone,
  };

  try {
    // Initiate Skrill payment session
    const response = await axios.post('https://pay.skrill.com', skrillData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // Extract session ID from response
    const sessionIdMatch = response.data.match(/sid=([^&]+)/);
    if (!sessionIdMatch) {
      throw new Error('Failed to retrieve Skrill session ID');
    }
    const sessionId = sessionIdMatch[1];
    const paymentUrl = `https://pay.skrill.com?sid=${sessionId}`;

    res.status(200).json({ url: paymentUrl });
  } catch (error) {
    console.error('Skrill initiation error:', error.message);
    res.status(500).json({ error: 'Failed to initiate Skrill payment', details: error.message });
  }
};