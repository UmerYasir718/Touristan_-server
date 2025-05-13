// Make sure environment variables are loaded
require('dotenv').config();

// Check if the Stripe key is available and log it for debugging (only partial key for security)
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('STRIPE_SECRET_KEY is not defined in environment variables');
  // Provide a fallback for development to prevent crashes
  process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder';
} else {
  // Log the first 6 and last 4 characters of the key for verification
  const keyStart = stripeKey.substring(0, 6);
  const keyEnd = stripeKey.substring(stripeKey.length - 4);
  console.log(`Using Stripe key: ${keyStart}...${keyEnd}`);
}

// Initialize Stripe with the API key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
