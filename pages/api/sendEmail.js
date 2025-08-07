// Example Resend API endpoint (for email confirmations)
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, subject, text } = req.body;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DelayPay <support@delaypay.co.uk>',
        to: [email],
        subject,
        text
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}