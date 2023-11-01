import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe('pk_live_51O2I2YKXx5O0k1EREaaDOUQ29kTPCbReJyaYwMW1joWOFiqMbIijZdOtTtu1eSU4s1lJ4YHpTlwrSl7d7gYka4Q600McB7zaLj');
  }
  return stripePromise;
};

export default getStripe;
