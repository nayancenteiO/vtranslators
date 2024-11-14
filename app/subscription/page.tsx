'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Zap } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    features: [
      'Up to 1,000 translations per month',
      'Access to 50+ languages',
      'Basic support',
      'No ads',
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 19.99,
    features: [
      'Unlimited translations',
      'Access to all languages',
      'Priority support',
      'No ads',
      'API access',
      'Custom terminology',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom AI model training',
      'Advanced analytics',
      'SLA guarantee',
      'Team collaboration tools',
    ],
  },
];

function ThankYouMessage() {
  return (
    <div className="text-center py-12 px-4">
      <div className="mb-4">
        <div className="h-16 w-16 rounded-full bg-green-100 mx-auto flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2">Thank You for Your Subscription!</h2>
      <p className="text-gray-600 mb-4">
        Your payment has been processed successfully. You now have access to all premium features.
      </p>
      <Button onClick={() => window.location.href = '/'}>
        Return to Dashboard
      </Button>
    </div>
  );
}

function PaymentForm({ 
  plan, 
  onSuccess,
  onCancel 
}: { 
  plan: Plan;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(plan.price * 100),
          email,
          name,
          planId: plan.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const { clientSecret } = await response.json();

      const { error: submitError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name,
            email,
          },
        }
      });

      if (submitError) {
        setError(submitError.message || 'An error occurred while processing your payment.');
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mt-8">
      <h3 className="text-lg font-semibold mb-4">Complete your {plan.name} subscription</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card">Card Details</Label>
            <div className="border rounded-md p-3">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={!stripe || loading}
            className="flex-1"
          >
            {loading ? 'Processing...' : `Pay $${plan.price}/month`}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500">
          Your payment is secured by Stripe
        </p>
      </form>
    </Card>
  );
}

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  if (showThankYou) {
    return <ThankYouMessage />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-600">
          Select the perfect plan for your translation needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`p-6 ${plan.popular ? 'border-blue-500 border-2' : ''}`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm rounded-bl-lg rounded-tr-lg">
                Popular
              </div>
            )}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
              <div className="text-3xl font-bold">
                ${plan.price}
                <span className="text-base font-normal text-gray-500">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={plan.popular ? 'default' : 'outline'}
              onClick={() => setSelectedPlan(plan)}
            >
              {plan.popular && <Zap className="h-4 w-4 mr-2" />}
              Get Started
            </Button>
          </Card>
        ))}
      </div>

      {selectedPlan && (
        <Elements stripe={stripePromise}>
          <PaymentForm
            plan={selectedPlan}
            onSuccess={() => setShowThankYou(true)}
            onCancel={() => setSelectedPlan(null)}
          />
        </Elements>
      )}
    </div>
  );
}
