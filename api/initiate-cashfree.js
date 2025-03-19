const axios = require('axios');

module.exports = async (req, res) => {
  const { userId, amount, email, firstname, phone } = req.body;
  const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
  const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
  const CASHFREE_API_URL = 'https://sandbox.cashfree.com/pg/orders';

  // Validate required fields
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    console.error('Missing Cashfree credentials');
    return res.status(500).json({ error: 'Missing Cashfree credentials' });
  }
  if (!userId) {
    console.error('Missing customer_id (userId) in request:', req.body);
    return res.status(400).json({ error: 'customer_id is required' });
  }
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    console.error('Invalid amount in request:', req.body);
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  console.log('Cashfree Request:', { userId, amount, CASHFREE_APP_ID });

  const orderData = {
    order_amount: Number(amount),
    order_currency: 'INR',
    customer_id: userId, // Explicitly required by Cashfree
    customer_name: firstname || 'Unknown',
    customer_email: email || 'default@example.com',
    customer_phone: phone || '9999999999',
    return_url: 'https://cricket-backend-seven.vercel.app/api/cashfree-success',
    notify_url: 'https://cricket-backend-seven.vercel.app/api/cashfree-webhook',
  };

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
    const paymentLink = response.data.payment_link;
    if (!paymentLink) throw new Error('No payment_link returned');
    res.status(200).json({ url: paymentLink });
  } catch (error) {
    console.error('Cashfree Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    res.status(500).json({ error: 'Cashfree initiation failed', details: error.response?.data || error.message });
  }
};