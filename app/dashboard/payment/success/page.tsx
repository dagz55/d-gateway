'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Download, ArrowRight, Package } from 'lucide-react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const sessionId = searchParams.get('session_id')
  const paymentIntentId = searchParams.get('payment_intent')

  useEffect(() => {
    // In production, you would verify the payment with Stripe
    // For now, we'll simulate a successful payment
    if (sessionId || paymentIntentId) {
      // TODO: Verify payment with Stripe webhook or API
      setPaymentDetails({
        id: sessionId || paymentIntentId,
        amount: 99.99,
        currency: 'USD',
        status: 'succeeded',
        package: 'Premium Trading Signals',
        timestamp: new Date().toISOString()
      })
      setIsLoading(false)
    } else {
      // Redirect if no payment session
      router.push('/dashboard')
    }
  }, [sessionId, paymentIntentId, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-3xl text-green-800">Payment Successful!</CardTitle>
          <CardDescription className="text-green-600 text-lg">
            Your subscription has been activated and you now have access to premium features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Transaction ID</p>
                <p className="font-mono text-green-700">{paymentDetails?.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Amount</p>
                <p className="font-semibold text-green-700">${paymentDetails?.amount} {paymentDetails?.currency}</p>
              </div>
              <div>
                <p className="text-gray-600">Package</p>
                <p className="text-green-700">{paymentDetails?.package}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  {paymentDetails?.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-4">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Access Your Dashboard</p>
                  <p className="text-blue-600 text-sm">Your premium features are now active in your dashboard</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Receive Trading Signals</p>
                  <p className="text-blue-600 text-sm">Start receiving premium trading signals and market analysis</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Download Receipt</p>
                  <p className="text-blue-600 text-sm">Save your payment receipt for your records</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="flex-1"
              size="lg"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              size="lg"
              onClick={() => {
                // Generate and download receipt
                const receiptData = {
                  transactionId: paymentDetails?.id,
                  amount: paymentDetails?.amount,
                  currency: paymentDetails?.currency,
                  package: paymentDetails?.package,
                  date: paymentDetails?.timestamp,
                  status: paymentDetails?.status
                }
                
                const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `zignal-payment-receipt-${paymentDetails?.id}.json`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
          </div>

          {/* Support Information */}
          <div className="text-center text-sm text-gray-600">
            <p>
              Need help? Contact our support team at{' '}
              <a href="mailto:support@zignal.com" className="text-blue-600 hover:underline">
                support@zignal.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
