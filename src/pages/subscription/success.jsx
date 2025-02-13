import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle } from 'lucide-react'
import axios from 'axios'

export const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams()
  const [sessionData, setSessionData] = useState(null)
  const sessionId = searchParams.get('session_id')
  console.log('sessionId', sessionId)

  useEffect(() => {
    const getSessionDetails = async () => {
      try {
        const { data } = await axios.get(`/api/subscription/session/${sessionId}`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        })
        setSessionData(data)
      } catch (error) {
        console.error('Error fetching session:', error.response?.data || error.message)
      }
    }

    if (sessionId) {
      getSessionDetails()
    }
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-green-600 mb-2">
          Subscription Activated!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for subscribing. Your account has been successfully upgraded.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/">
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/billing/pricing">
              View Billing Details
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
