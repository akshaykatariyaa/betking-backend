const axios = require('axios');

module.exports = async (req, res) => {
  const { userId, amount, email, firstname, phone } = req.body;
  console.log('Incoming request body:', req.body);
  console.log('Extracted userId:', userId);

  const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
  const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
  const CASHFREE_API_URL = 'https://sandbox.cashfree.com/pg/orders';

  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    console.error('Missing Cashfree credentials');
    return res.status(500).json({ error: 'Missing Cashfree credentials' });
  }
  if (!userId) {
    console.error('Missing customer_id:', req.body);
    return res.status(400).json({ error: 'customer_id is required' });
  }
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    console.error('Invalid amount:', req.body);
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  const orderData = {
    order_amount: Number(amount),
    order_currency: 'INR',
    customer_details: {
      customer_id: userId,
      customer_name: firstname || 'Unknown',
      customer_email: email || 'default@example.com',
      customer_phone: phone || '9999999999',
    },
    return_url: 'https://cricket-backend-seven.vercel.app/api/cashfree-success',
    notify_url: 'https://cricket-backend-seven.vercel.app/api/cashfree-webhook',
  };

  console.log('Order data sent to Cashfree:', orderData);

  try {
    const response = await axios.post(CASHFREE_API_URL, orderData, {
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log('Cashfree Response:', response.data);
    res.status(200).json({ url: response.data.payment_link });
  } catch (error) {
    console.error('Cashfree Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Cashfree initiation failed', details: error.response?.data || error.message });
  }
};