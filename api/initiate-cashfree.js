const { Pool } = require('pg');
const axios = require('axios');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = async (req, res) => {
  const { userId, amount, email, firstname, phone } = req.body;

  // Cashfree credentials (ensure these are set in Vercel env vars)
  const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || 'your-app-id';
  const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || 'your-secret-key';
  const CASHFREE_API_URL = 'https://sandbox.cashfree.com/pg/orders'; // Sandbox URL

  // Log credentials and request body for debugging
  console.log('Cashfree App ID:', CASHFREE_APP_ID);
  console.log('Cashfree Secret Key:', CASHFREE_SECRET_KEY);
  console.log('Request Body:', req.body);

  try {
    const orderData = {
      order_amount: Number(amount),
      order_currency: 'INR',
      order_note: `Deposit for PredictKing User ${userId}`,
      customer_id: userId,
      customer_name: firstname,
      customer_email: email,
      customer_phone: phone,
      return_url: 'https://cricket-backend-seven.vercel.app/api/cashfree-success',
      notify_url: 'https://cricket-backend-seven.vercel.app/api/cashfree-webhook',
    };

    const response = await axios.post(CASHFREE_API_URL, orderData, {
      headers: {
        'x-api-version': '2023-08-01', // Updated to latest version as of 2025 (check Cashfree docs)
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log('Cashfree Response:', response.data);
    const paymentLink = response.data.payment_link;
    if (!paymentLink) throw new Error('No payment link returned');
    res.status(200).json({ url: paymentLink });
  } catch (error) {
    console.error('Cashfree initiation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initiate Cashfree payment', details: error.response?.data || error.message });
  }
};