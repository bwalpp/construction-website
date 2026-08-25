// /api/paymongo-checkout.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, amount } = req.body;

  try {
    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY).toString('base64')}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            payment_method_types: ['gcash', 'card', 'dob'],
            line_items: [
              {
                currency: 'PHP',
                amount: amount, // amount in centavos
                description: 'Construction Supply Materials',
                name: name,
                quantity: 1
              }
            ]
          }
        }
      })
    });

    const data = await response.json();
    return res.status(200).json({ checkout_url: data.data.attributes.checkout_url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
