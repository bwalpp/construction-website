const stripe = require('stripe')(process.env.stripe_secret_key);

module.exports = async (req, res) => {
  // Allow cross-origin / preflight if needed
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { name, price, quantity } = req.body;

    // Validate incoming data
    if (!name || !price) {
      return res.status(400).json({ error: 'Missing name or price parameter.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'php',
            product_data: {
              name: name,
            },
            unit_amount: Math.round(Number(price) * 100), // Converts 285 to 28500 cents
          },
          quantity: Number(quantity) || 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'https://construction-website-99un.vercel.app'}?success=true`,
      cancel_url: `${req.headers.origin || 'https://construction-website-99un.vercel.app'}?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
