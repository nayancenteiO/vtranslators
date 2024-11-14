import Stripe from 'stripe';

// For client-side
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QKzcxDSLnjOQfn7s1DE4XoAyiofhlYVytCmTszve8BvDhHBY3SgwU3S8jhyB6m6ffmsUDGwMRViBqezV85mMaK900sY16jxpc';

// For server-side
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51QKzcxDSLnjOQfn7zEwTgdSFA9AHq4glfmNnALQXIoUM3UPbPNuQueelpoYjrSgliLFbio4TrljYoOCsFBJxkTlE0001F9R7Y5';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-10-28.acacia',
  typescript: true,
});
