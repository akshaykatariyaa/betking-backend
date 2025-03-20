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
    // Step 1: Create the order
    const orderResponse = await axios.post(CASHFREE_API_URL, orderData, {
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log('Cashfree Order Response:', orderResponse.data);

    if (!orderResponse.data.payment_session_id) {
      throw new Error('No payment_session_id returned from Cashfree');
    }

    // Step 2: Get the payment link using the order ID
    const orderId = orderResponse.data.order_id;
    const paymentLinkResponse = await axios.get(`${CASHFREE_API_URL}/${orderId}/payments`, {
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log('Cashfree Payment Link Response:', paymentLinkResponse.data);

    const paymentUrl = paymentLinkResponse.data.payment_link || `https://sandbox.cashfree.com/pg/session/${orderResponse.data.payment_session_id}`;
    console.log('Generated payment URL:', paymentUrl);
    res.status(200).json({ url: paymentUrl });
  } catch (error) {
    console.error('Cashfree Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Cashfree initiation failed', details: error.response?.data || error.message });
  }
};