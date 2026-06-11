const path = require('path');
const express = require('express');
const Stripe = require('stripe');
const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const SUCCESS_URL = 'https://inkalatia.github.io/success/success.html';
const CANCEL_URL = 'https://inkalatia.github.io/cancel/cancel.html';

// ======== SHOP ITEMS CONFIGURATION ========
const SHOP_ITEMS = {
  // Skins
  'barbarians': { 
    name: 'barbarians',
    stripe_product_id: 'prod_Sux7RQSokhB6pz',
    stripe_price_id: 'price_1Rz7DMFTxUtP1E0qNGiG3xui'
  },
  'barbarianscens': {
    name: 'barbarianscens',
    stripe_product_id: 'prod_Sux7peRamVnk9P',
    stripe_price_id: 'price_1Rz7DaFTxUtP1E0qeTSgyMGo'
  },
  'fairies': {
    name: 'fairies',
    stripe_product_id: 'prod_Sux9bOzhZkJ5z4',
    stripe_price_id: 'price_1Rz7FWFTxUtP1E0qjrGfAQYM'
  },
  'fairiescens': {
    name: 'fairiescens',
    stripe_product_id: 'prod_Sux8MZ5Jor7ghj',
    stripe_price_id: 'price_1Rz7DoFTxUtP1E0qI7wN0HeW'
  },
  'fantasyunc': {
    name: 'fantasyunc',
    stripe_product_id: 'prod_Sux8mE9lyvZbCb',
    stripe_price_id: 'price_1Rz7DrFTxUtP1E0qlktNHloy'
  },
  'sketchesunc':  {
    name: 'sketchesunc',
    stripe_product_id: 'prod_Sux8WiswQOvcO9',
    stripe_price_id: 'price_1Rz7DtFTxUtP1E0qutsApAwM'
  },
  // Magic Dust
  '500magicdust': {
    name: '500magicdust',
    stripe_product_id: 'prod_Sux8dQFNmF2UYn',
    stripe_price_id: 'price_1Rz7DvFTxUtP1E0q7rGzO6we'
  },
  '1100magicdust': {
    name: '1100magicdust',
    stripe_product_id: 'prod_Sux8rEUVpZBeES',
    stripe_price_id: 'price_1Rz7DyFTxUtP1E0qN9xndM8o'
  },
  '2500magicdust': {
    name: '2500magicdust',
    stripe_product_id: 'prod_Sux8bmF2wwQHvN',
    stripe_price_id: 'price_1Rz7E0FTxUtP1E0qy6ZNovUV'
  },
};

const SHOP_ITEMS_TEST = {
  // Skins
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

    const product = SHOP_ITEMS[product_id];
    const priceId = product.stripe_price_id;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['wechat_pay', 'card', 'amazon_pay'],
      payment_method_options: {
        wechat_pay: { client: 'web' }
      },
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&product_id=${product_id}&email=${encodeURIComponent(email)}&game=fantasypuzzle`,
      cancel_url: CANCEL_URL,
      customer_email: email,
      payment_intent_data: {
        description: `Purchase: ${product.name}`,
        metadata: {
          internal_product_id: product_id
        }
      },
      metadata: { 
        internal_product_id: product_id,
        product_name: product.name
      }
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

// ======== PURCHASE VERIFICATION ========
app.post('/verify_purchase', async (req, res) => {
  try {
    const { product_id, email, game } = req.body; // Add game parameter
    
    if (!product_id || !email) {
      return res.status(400).json({ 
        error: 'Missing product_id or email' 
      });
    }
    
    // Check Stripe charges for this email and product
    const isPurchased = await checkStripePurchase(email, product_id);
    
    res.json({ 
      valid: isPurchased,
      product_id: product_id,
      email: email,
      game: game || 'fantasypuzzle' // Include game in response
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ 
      error: "Purchase verification failed",
      details: error.message
    });
  }
});

// Helper function to check Stripe purchases
async function checkStripePurchase(email, productId) {
  try {
    // First try to find by customer email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    let isPurchased = false;

    // Check if customer exists and has purchased this product
    if (customers.data.length > 0) {
      const customer = customers.data[0];
      
      // Check payment intents for this customer
      const paymentIntents = await stripe.paymentIntents.list({
        customer: customer.id,
        limit: 100,
      });

      isPurchased = paymentIntents.data.some(intent => 
        intent.metadata.internal_product_id === productId &&
        intent.status === 'succeeded'
      );
    }

    // If not found via customer, search all charges
    if (!isPurchased) {
      const charges = await stripe.charges.list({
        limit: 100,
      });

      isPurchased = charges.data.some(charge => 
        charge.billing_details?.email === email &&
        charge.metadata.internal_product_id === productId &&
        charge.status === 'succeeded'
      );
    }

    return isPurchased;
  } catch (error) {
    console.error("Stripe check error:", error);
    return false;
  }
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
