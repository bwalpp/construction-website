const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  const { name, price, quantity } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'php',
        product_data: { name: name },
        unit_amount: Math.round(price * 100), // Converted to cents: 285.00 -> 28500
      },
      quantity: quantity || 1,
    }],
    mode: 'payment',
    success_url: `${req.headers.origin}/?success=true`,
    cancel_url: `${req.headers.origin}/?canceled=true`,
  });

  res.status(200).json({ url: session.url });
};
