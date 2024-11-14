'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'

export default function PaymentSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Thank you for subscribing to VTranslate Premium. Your account has been upgraded and you now have access to all premium features.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Your premium benefits:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Unlimited translations
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Access to all languages
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Priority support
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Ad-free experience
              </li>
            </ul>
          </div>

          <Button 
            className="w-full"
            onClick={() => router.push('/')}
          >
            Return to Dashboard
          </Button>

          <p className="text-sm text-gray-500">
            A confirmation email has been sent to your inbox with your subscription details.
          </p>
        </div>
      </Card>
    </div>
  )
}
