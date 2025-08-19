const path = require('path');
const express = require('express');
const Stripe = require('stripe');
const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY) || ('sk_test_51QV1GQFTxUtP1E0qXgWALeObPMxehMmlNRoN1ZclaKuzYPflpqS78imiTN1hwshmFGqNkx11a9c9z0R3fm771ZEg00eBR4h5oP');
const SUCCESS_URL = 'https://inkalatia.github.io/success/success.html'; // Mirror premium flow
const CANCEL_URL = 'https://inkalatia.github.io/cancel/cancel.html';

// ======== SHOP ITEMS CONFIGURATION ========
const SHOP_ITEMS = {
  // Skins this is for live
  'barbarians': { 
    name: 'barbarians',
    stripe_product_id: 'prod_SsaIOvKb0ZKRvR',
    stripe_price_id: 'price_1Rwp7RFTxUtP1E0qpekvQ7e2'
  },
  'barbarianscens': {
    name: 'barbarianscens',
    stripe_product_id: 'prod_SsaKjrJGrK2gqo',
    stripe_price_id: 'price_1Rwp9RFTxUtP1E0qjuOA41rk'
  },
  'fairies': {
    name: 'fairies',
    stripe_product_id: 'prod_SsaMC1sKyxp0gX',
    stripe_price_id: 'price_1RwpBiFTxUtP1E0qGGHPg3pu'
  },
  'fairiescens': {
    name: 'fairiescens',
    stripe_product_id: 'prod_SsaNawRruN8Cz8',
    stripe_price_id: 'price_1RwpD3FTxUtP1E0qSn8SOkeg'
  },
  'fantasyunc': {
    name: 'fantasyunc',
    stripe_product_id: 'prod_SsaPmW7ZuQ7F9Q',
    stripe_price_id: 'price_1RwpEfFTxUtP1E0q70QUuZsB'
  },
  
  'sketchesunc':  {
    name: 'sketchesunc',
    stripe_product_id: 'prod_SsaQBBbtLr1i23',
    stripe_price_id: 'price_1RwpFmFTxUtP1E0qDchIeP4D'
  },
  
// Magic Dust

  '500magicdust': {
    name: '500magicdust',
    stripe_product_id: 'prod_SsaVjH9bs8jDm7',
    stripe_price_id: 'price_1RwpKGFTxUtP1E0qJOaPcjHH'
  },
  '1100magicdust': {
    name: '1100magicdust',
    stripe_product_id: 'prod_SsaX8EaZ6w3kX4',
    stripe_price_id: 'price_1RwpMoFTxUtP1E0qrOxpKpCo'
  },
  '2500magicdust': {
    name: '2500magicdust',
    stripe_product_id: 'prod_SsaZGWh1LKW1JP',
    stripe_price_id: 'price_1RwpObFTxUtP1E0q5tMbGaWi'
  },
};

const SHOP_ITEMS2 = {
  // Galleries THIS IS ALL TEST MODE
  'barbarians': { 
    name: 'barbarians',
    stripe_product_id: 'prod_SsaIOvKb0ZKRvR',
    stripe_price_id: 'price_1Rwp7RFTxUtP1E0qpekvQ7e2'
  },
  'barbarianscens': {
    name: 'barbarianscens',
    stripe_product_id: 'prod_SsaKjrJGrK2gqo',
    stripe_price_id: 'price_1Rwp9RFTxUtP1E0qjuOA41rk'
  },
  'fairies': {
    name: 'fairies',
    stripe_product_id: 'prod_SsaMC1sKyxp0gX',
    stripe_price_id: 'price_1RwpBiFTxUtP1E0qGGHPg3pu'
  },
  'fairiescens': {
    name: 'fairiescens',
    stripe_product_id: 'prod_SsaNawRruN8Cz8',
    stripe_price_id: 'price_1RwpD3FTxUtP1E0qSn8SOkeg'
  },
  'fantasyunc': {
    name: 'fantasyunc',
    stripe_product_id: 'prod_SsaPmW7ZuQ7F9Q',
    stripe_price_id: 'price_1RwpEfFTxUtP1E0q70QUuZsB'
  },
  
  'sketchesunc':  {
    name: 'sketchesunc',
    stripe_product_id: 'prod_SsaQBBbtLr1i23',
    stripe_price_id: 'price_1RwpFmFTxUtP1E0qDchIeP4D'
  },
  
// Magic Dust

  '500magicdust': {
    name: '500magicdust',
    stripe_product_id: 'prod_SsaVjH9bs8jDm7',
    stripe_price_id: 'price_1RwpKGFTxUtP1E0qJOaPcjHH'
  },
  '1100magicdust': {
    name: '1100magicdust',
    stripe_product_id: 'prod_SsaX8EaZ6w3kX4',
    stripe_price_id: 'price_1RwpMoFTxUtP1E0qrOxpKpCo'
  },
  '2500magicdust': {
    name: '2500magicdust',
    stripe_product_id: 'prod_SsaZGWh1LKW1JP',
    stripe_price_id: 'price_1RwpObFTxUtP1E0q5tMbGaWi'
  },
};
// ======== END OF SHOP CONFIG ========

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Fantasy Puzzle Stripe Backend Online');
});

// ======== SHOP ENDPOINT ========
app.post('/create_shop_session', async (req, res) => {
  try {
    const { product_id, email } = req.body;
    
    if (!SHOP_ITEMS[product_id]) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        valid_ids: Object.keys(SHOP_ITEMS)
      });
    }

    const priceId = SHOP_ITEMS[product_id].stripe_price_id;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'wechat_pay'],
      payment_method_options: {
        wechat_pay: { client: 'web' }
      },
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&product_id=${product_id}`,
      cancel_url: CANCEL_URL,
      customer_email: email,
      metadata: { game_item_id: product_id }
    });

    res.json({ 
      url: session.url,
      session_id: session.id,
      expires_at: session.expires_at
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ 
      error: "Failed to create checkout session",
      details: error.message
    });
  }
});

// ======== WEBHOOK FULFILLMENT ========
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error('❌ Missing webhook secret');
    return res.status(400).send('Webhook secret not configured');
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );

    // Handle successful payments
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const productId = session.metadata.game_item_id;
      const email = session.customer_email;

      console.log(`✅ Payment succeeded: ${session.id}`);
      console.log(`   Product: ${productId}, Email: ${email}`);
      
      // Add your fulfillment logic here:
      console.log("⚠️ Fulfillment needed: Grant product to user");
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('❌ Webhook Error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// ======== PURCHASE VERIFICATION ========
app.post('/verify_purchase', async (req, res) => {
  try {
    const { session_id, product_id } = req.body;
    
    if (!session_id || !product_id) {
      return res.status(400).json({ 
        error: 'Missing session_id or product_id' 
      });
    }
    
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    const isVerified = session.payment_status === 'paid' && 
                      session.metadata.game_item_id === product_id;
    
    res.json({ 
      valid: isVerified,
      product_id: session.metadata.game_item_id,
      email: session.customer_email,
      amount_paid: session.amount_total / 100 // Convert to dollars
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ 
      error: "Purchase verification failed",
      details: error.message
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
