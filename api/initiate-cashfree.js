const { Pool } = require('pg');
const Stripe = require('stripe');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Initialize Stripe with your secret key (store in environment variables)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'your-secret-key-here');

module.exports = async (req, res) => {
  const { userId, amount, email, firstname, phone } = req.body;

  try {
    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Add 'upi' if you enable it in Stripe Dashboard
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'PredictKing Deposit',
              description: `Deposit for User ${userId}`,
            },
            unit_amount: Math.round(amount * 100), // Amount in paise (INR * 100)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      metadata: { userId, firstname, phone },
      success_url: 'https://cricket-backend-seven.vercel.app/api/stripe-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://cricket-backend-seven.vercel.app/api/stripe-failure',
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe initiation error:', error.message);
    res.status(500).json({ error: 'Failed to initiate Stripe payment', details: error.message });
  }
};