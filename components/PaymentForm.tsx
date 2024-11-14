import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  CardElement,
} from '@stripe/react-stripe-js';
import type { Appearance } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '../lib/stripe';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const appearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#0570de',
    colorBackground: '#ffffff',
    colorText: '#30313d',
    colorDanger: '#df1b41',
    fontFamily: 'system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '4px',
  },
};

function PlanDetails({ onProceed }: { onProceed: () => void }) {
  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Premium Plan</h2>
        <p className="text-gray-600">Unlock all premium features</p>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold">
            $9.99
            <span className="text-lg text-gray-500 font-normal">/month</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">What&apos;s included:</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-sm">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Unlimited translations
              </li>
              <li className="flex items-center text-sm">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Access to all languages
              </li>
              <li className="flex items-center text-sm">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Priority support
              </li>
              <li className="flex items-center text-sm">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                No ads
              </li>
            </ul>
          </div>
        </div>

        <Button 
          onClick={onProceed}
          className="w-full"
        >
          Continue to Payment
        </Button>

        <p className="text-xs text-center text-gray-500">
          Cancel anytime. No commitment required.
        </p>
      </div>
    </Card>
  );
}

function CheckoutForm({ onBack }: { onBack: () => void }) {
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
      // First create the payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: 999,
          email,
          name,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const { clientSecret } = await response.json();

      // Then confirm the payment
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
        window.location.href = '/payment-success';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plan
        </Button>
        
        <h3 className="text-lg font-semibold">Complete your purchase</h3>
        <p className="text-sm text-muted-foreground">
          Premium Plan - $9.99/month
        </p>
      </div>

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
                id="card"
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

        <Button
          type="submit"
          disabled={!stripe || loading}
          className="w-full"
        >
          {loading ? 'Processing...' : 'Subscribe Now'}
        </Button>

        <p className="text-xs text-center text-gray-500">
          Your payment is secured by Stripe
        </p>
      </form>
    </Card>
  );
}

export function PaymentForm() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  if (!showPaymentForm) {
    return <PlanDetails onProceed={() => setShowPaymentForm(true)} />;
  }

  return (
    <Elements stripe={stripePromise} options={{ appearance }}>
      <CheckoutForm onBack={() => setShowPaymentForm(false)} />
    </Elements>
  );
}
