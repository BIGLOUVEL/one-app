import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
})

// Price IDs from Stripe Dashboard
export const PRICES = {
  PROMO: process.env.STRIPE_PRICE_ID_PROMO!, // $1.99 first month
  REGULAR: process.env.STRIPE_PRICE_ID_REGULAR!, // $6.99/month
}
