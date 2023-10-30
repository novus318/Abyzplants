import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe('pk_test_51O2I2YKXx5O0k1ERrK2dLG1BB2F19YshUkb4RElRaLyn75lpYoWYP3ndKtTRrNUn6OP6azjij2JimmsjLdndXZZe00z6Fnnibo');
  }
  return stripePromise;
};

export default getStripe;
