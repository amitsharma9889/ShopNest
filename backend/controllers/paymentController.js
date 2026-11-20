const Razorpay = require('razorpay');
const crypto = require('crypto');

const createOrder = async (req, res) => {
  const amount = Number(req.body && req.body.amount);
  if (!Number.isSafeInteger(amount) || amount < 100) {
    return res.status(400).json({ message: 'Amount must be at least 100 paise.' });
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ message: 'Razorpay credentials are not configured.' });
  }

  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount,
      currency: 'INR',
      receipt: `shopnest-${Date.now()}`,
    });

    res.status(201).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    const providerError = error.error || {};
    const details = providerError.description || error.message;
    console.error(
      `Razorpay order creation failed (status: ${error.statusCode || 'unknown'}, code: ${providerError.code || 'unknown'}): ${details}`
    );
    res.status(500).json({
      message: providerError.description ||
        'Unable to create a Razorpay order. Check the Test Mode credentials in backend/.env and backend network access.',
    });
  }
};

const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  if (
    typeof razorpay_order_id !== 'string' || !razorpay_order_id ||
    typeof razorpay_payment_id !== 'string' || !razorpay_payment_id ||
    typeof razorpay_signature !== 'string' || !/^[a-f\d]{64}$/i.test(razorpay_signature)
  ) {
    return res.status(400).json({ message: 'Payment verification fields are missing or invalid.' });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ message: 'Razorpay credentials are not configured.' });
  }

  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest();
  const receivedSignature = Buffer.from(razorpay_signature, 'hex');

  if (
    expectedSignature.length !== receivedSignature.length ||
    !crypto.timingSafeEqual(expectedSignature, receivedSignature)
  ) {
    return res.status(400).json({ message: 'Payment signature verification failed.' });
  }

  return res.status(200).json({ verified: true, message: 'Payment verified successfully.' });
};

module.exports = { createOrder, verifyPayment };
