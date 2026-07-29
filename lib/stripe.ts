import Stripe from "stripe";

// Initialize Stripe with the secret key from environment variables
// Use a placeholder if not set to prevent build errors, but it will fail at runtime if actually used without a real key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2023-10-16" as any, // Use standard stable version, type assertion may be needed based on SDK version
  appInfo: {
    name: "Zozo Booking",
    version: "0.1.0",
  },
});

export const getStripeAppUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return "http://localhost:3000";
};
