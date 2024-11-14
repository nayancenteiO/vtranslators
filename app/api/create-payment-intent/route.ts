import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe';

const PLAN_DESCRIPTIONS = {
  basic: 'Basic Plan - Up to 1,000 translations/month',
  pro: 'Professional Plan - Unlimited translations with priority support',
  enterprise: 'Enterprise Plan - Full feature access with dedicated support',
};

export async function POST(req: Request) {
  try {
    const { amount, email, name, planId } = await req.json();

    // Create a PaymentIntent with the specified amount and customer details
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // amount in cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        product: 'VTranslate Subscription',
        plan: planId,
        customerName: name,
        customerEmail: email,
      },
      receipt_email: email,
      description: PLAN_DESCRIPTIONS[planId as keyof typeof PLAN_DESCRIPTIONS] || 'VTranslate Subscription',
      setup_future_usage: 'off_session', // Enable future subscription payments
    });

    // Create or update customer in Stripe
    let customer = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (customer.data.length === 0) {
      await stripe.customers.create({
        email,
        name,
        metadata: {
          planId,
        },
      });
    } else {
      await stripe.customers.update(customer.data[0].id, {
        name,
        metadata: {
          planId,
        },
      });
    }

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error creating payment intent' }, 
      { status: 500 }
    );
  }
}
