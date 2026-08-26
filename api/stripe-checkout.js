const Stripe = require('stripe');
const stripe = Stripe(process.env.stripe_secret_key);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, amount } = req.body;

    // Convert string to integer and multiply by 100 for cents/centavos
    const unitAmount = Math.round(parseFloat(amount) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'php', // Or 'usd' depending on your Stripe dashboard default
            product_data: { name: name || 'Construction Supply' },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe API Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
