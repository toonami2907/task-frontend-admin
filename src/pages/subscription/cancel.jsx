import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { XCircle } from 'lucide-react'

export const SubscriptionCancel = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Subscription Not Completed
        </h1>
        <p className="text-gray-600 mb-6">
          The subscription process was cancelled. If you experienced any issues, please contact our support team.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/billing/pricing">
              Return to Plans
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="#">
              Contact Support
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
