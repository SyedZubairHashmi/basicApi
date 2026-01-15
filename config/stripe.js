const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create a payment intent
const createPaymentIntent = async (amount, currency = "usd", metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency,
      metadata,
    });
    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return { success: false, error: error.message };
  }
};

// Retrieve payment intent details
const getPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      metadata: paymentIntent.metadata,
    };
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    return { success: false, error: error.message };
  }
};

// Create a customer
const createCustomer = async (email, name = "", metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    return { success: true, customerId: customer.id };
  } catch (error) {
    console.error("Error creating customer:", error);
    return { success: false, error: error.message };
  }
};

// Create a subscription (for recurring payments)
const createSubscription = async (customerId, priceId) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });
    return {
      success: true,
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return { success: false, error: error.message };
  }
};

// Refund a payment
const refundPayment = async (paymentIntentId, amount = null) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return {
      success: true,
      refundId: refund.id,
      status: refund.status,
    };
  } catch (error) {
    console.error("Error refunding payment:", error);
    return { success: false, error: error.message };
  }
};

// Verify webhook signature
const verifyWebhookSignature = (body, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return { success: true, event };
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  stripe,
  createPaymentIntent,
  getPaymentIntent,
  createCustomer,
  createSubscription,
  refundPayment,
  verifyWebhookSignature,
};
