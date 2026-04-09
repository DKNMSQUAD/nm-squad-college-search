import { loadStripe } from "@stripe/stripe-js";

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder";
let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise) stripePromise = loadStripe(STRIPE_KEY);
  return stripePromise;
};

// Demo mode: simulates payment. Replace with real backend session in production.
export const initiateCheckout = async ({ collegeId, price, onSuccess }) => {
  const isDemo = !STRIPE_KEY || STRIPE_KEY === "pk_test_placeholder" || !STRIPE_KEY.startsWith("pk_");
  if (isDemo) {
    return new Promise((resolve) => {
      setTimeout(() => { onSuccess(collegeId); resolve({ demo: true }); }, 2000);
    });
  }
  // Real Stripe: create a session on your backend, then redirect
  // const stripe = await getStripe();
  // await stripe.redirectToCheckout({ sessionId });
};
