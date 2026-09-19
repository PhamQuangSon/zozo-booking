const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

async function test() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "vnd",
            product_data: {
              name: "Test item",
            },
            unit_amount: 15000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/en/payment/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/en/restaurants/1/1?payment_cancelled=true",
    });
    console.log("SUCCESS:", session.url);
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

test();
