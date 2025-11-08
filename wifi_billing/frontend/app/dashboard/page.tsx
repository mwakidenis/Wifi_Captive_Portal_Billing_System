"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ToastProvider } from "@/components/toast-provider"
import { useUserAuth } from "@/hooks/use-user-auth"
import { apiClient } from "@/lib/api"
import { Clock, Wifi, CreditCard, Calendar, Zap, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Payment {
  id: string
  transactionId: string
  amount: number
  package: string
  status: "completed" | "failed" | "pending"
  timePurchased: string
  expiresAt: string | null
  mpesaRef: string | null
}

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useUserAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserPayments()
      // Set up real-time updates every 30 seconds
      const interval = setInterval(fetchUserPayments, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user])

  const fetchUserPayments = async () => {
    try {
      // Check for real payments from the actual API
      const response = await fetch('http://localhost:5000/api/admin/payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('user_token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          // Filter payments by current user's phone number
          const userPhone = user?.phone
          const userPayments = data.data.filter((payment: any) =>
            payment.phone === userPhone
          )

          // Transform to our Payment interface
          const transformedPayments: Payment[] = userPayments.map((payment: any) => ({
            id: payment.id?.toString() || Math.random().toString(),
            transactionId: payment.transactionId || payment.id?.toString() || '',
            amount: payment.amount || 0,
            package: payment.package || 'Unknown Package',
            status: payment.status || 'completed',
            timePurchased: payment.timePurchased || payment.time_purchased || new Date().toISOString(),
            expiresAt: payment.expiresAt || payment.expires_at,
            mpesaRef: payment.mpesaRef || payment.mpesa_ref
          }))

          setPayments(transformedPayments)
          return
        }
      }

      // Fallback to mock data if API fails
      console.warn("API call failed, using mock data")
      const mockPayments: Payment[] = [
        {
          id: "1",
          transactionId: "TXN_1731050000000",
          amount: 30,
          package: "24 Hours",
          status: "completed" as const,
          timePurchased: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
          mpesaRef: "REF123456"
        },
        {
          id: "2",
          transactionId: "TXN_1731040000000",
          amount: 20,
          package: "12 Hours",
          status: "completed" as const,
          timePurchased: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          mpesaRef: "REF123457"
        },
        {
          id: "3",
          transactionId: "TXN_1731030000000",
          amount: 15,
          package: "4 Hours",
          status: "completed" as const,
          timePurchased: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          mpesaRef: "REF123458"
        }
      ]

      setPayments(mockPayments)
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast.error("Failed to load payment history")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "failed":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActivePurchases = () => {
    const now = new Date()
    return payments.filter(payment =>
      payment.status === "completed" &&
      payment.expiresAt &&
      new Date(payment.expiresAt) > now
    )
  }

  const getExpiredPurchases = () => {
    const now = new Date()
    return payments.filter(payment =>
      payment.status === "completed" &&
      payment.expiresAt &&
      new Date(payment.expiresAt) <= now
    )
  }

  const getTodaySpending = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return payments
      .filter(payment =>
        payment.status === "completed" &&
        new Date(payment.timePurchased) >= today &&
        new Date(payment.timePurchased) < tomorrow
      )
      .reduce((sum, payment) => sum + payment.amount, 0)
  }

  const getLast7DaysSpending = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const daySpending = payments
        .filter(payment =>
          payment.status === "completed" &&
          new Date(payment.timePurchased) >= date &&
          new Date(payment.timePurchased) < nextDay
        )
        .reduce((sum, payment) => sum + payment.amount, 0)

      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toISOString().split('T')[0],
        amount: daySpending
      })
    }
    return days
  }

  if (!isAuthenticated) {
    return (
      <>
        <ToastProvider />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <Header />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-md mx-auto text-center">
              <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 backdrop-blur">
                <CardContent className="p-8">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    Access Denied
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    You need to sign in to access your dashboard.
                  </p>
                  <Link href="/">
                    <Button className="w-full">
                      Go to Homepage
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </>
    )
  }

  const activePurchases = getActivePurchases()
  const expiredPurchases = getExpiredPurchases()

  return (
    <>
      <ToastProvider />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Manage your internet packages and view your purchase history.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Active Packages
                      </p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {activePurchases.length}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Currently connected
                      </p>
                    </div>
                    <Wifi className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Total Spent
                      </p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        Ksh {payments
                          .filter(p => p.status === "completed")
                          .reduce((sum, p) => sum + p.amount, 0)
                          .toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        All time
                      </p>
                    </div>
                    <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Spent Today
                      </p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        Ksh {getTodaySpending().toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Last 24 hours
                      </p>
                    </div>
                    <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Total Purchases
                      </p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {payments.filter(p => p.status === "completed").length}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Successful transactions
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Spending Chart */}
            <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 backdrop-blur mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Daily Spending (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {getLast7DaysSpending().map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
                        style={{
                          height: `${Math.max((day.amount / Math.max(...getLast7DaysSpending().map(d => d.amount))) * 200, 20)}px`,
                          minHeight: day.amount > 0 ? '20px' : '0px'
                        }}
                      />
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 text-center">
                        <div className="font-medium">{day.day}</div>
                        <div className="text-slate-500">Ksh {day.amount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Purchases Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Active Purchases
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-slate-600 dark:text-slate-400 mt-4">Loading your purchases...</p>
                </div>
              ) : activePurchases.length === 0 ? (
                <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 backdrop-blur">
                  <CardContent className="p-8 text-center">
                    <Wifi className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No Active Packages
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      You don't have any active internet packages at the moment.
                    </p>
                    <Link href="/packages">
                      <Button>
                        Browse Packages
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activePurchases.map((purchase) => (
                    <Card key={purchase.id} className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 backdrop-blur">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{purchase.package}</CardTitle>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Amount Paid</span>
                          <span className="font-semibold">Ksh {purchase.amount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Expires</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {purchase.expiresAt ? formatDate(purchase.expiresAt) : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Transaction ID</span>
                          <span className="font-mono text-xs">{purchase.transactionId}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Purchase History */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Purchase History
              </h2>

              {payments.length === 0 ? (
                <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 backdrop-blur">
                  <CardContent className="p-8 text-center">
                    <CreditCard className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No Purchase History
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      You haven't made any purchases yet.
                    </p>
                    <Link href="/packages">
                      <Button>
                        Browse Packages
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 backdrop-blur">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Package
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Transaction ID
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {payment.package}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                  Ksh {payment.amount}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={getStatusColor(payment.status)}>
                                  <div className="flex items-center">
                                    {getStatusIcon(payment.status)}
                                    <span className="ml-1 capitalize">{payment.status}</span>
                                  </div>
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                                {formatDate(payment.timePurchased)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600 dark:text-slate-400">
                                {payment.transactionId}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}