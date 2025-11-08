"use client"
import { useState, useEffect } from "react"
import { CheckCircle, Wifi, Zap, Clock, Star, ArrowRight, Phone, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ToastProvider } from "@/components/toast-provider"
import { PaymentSuccessModal } from "@/components/payment-success-modal"
import { toast } from "sonner"
import { apiClient, type PaymentRequest } from "@/lib/api"
import Link from "next/link"

const packages = [
  {
    id: 1,
    name: "Quick Browse",
    duration: "1 Hour",
    price: 10,
    speed: "2 Mbps",
    features: ["Basic browsing", "Social media", "Email access", "Standard support"],
    color: "yellow",
    popular: false,
    description: "Perfect for quick internet access and basic browsing needs.",
  },
  {
    id: 2,
    name: "Work Session",
    duration: "4 Hours",
    price: 15,
    speed: "3 Mbps",
    features: ["Video calls", "File downloads", "Streaming (SD)", "Priority support"],
    color: "green",
    popular: false,
    description: "Ideal for work sessions, video calls, and moderate usage.",
  },
  {
    id: 3,
    name: "Half Day",
    duration: "12 Hours",
    price: 20,
    speed: "4 Mbps",
    features: ["HD streaming", "Large downloads", "Gaming", "24/7 support"],
    color: "purple",
    popular: false,
    description: "Great for extended usage with faster speeds and HD streaming.",
  },
  {
    id: 4,
    name: "Full Day",
    duration: "24 Hours",
    price: 30,
    speed: "5 Mbps",
    features: ["Ultra-fast browsing", "4K streaming", "Unlimited downloads", "Premium support"],
    color: "blue",
    popular: true,
    description: "Our most popular package with maximum speed and unlimited access.",
  },
]

const PackageCard = ({ pkg, onPackageSelect }) => {
  const colorClasses = {
    yellow: "border-yellow-500 bg-yellow-500/5",
    green: "border-green-500 bg-green-500/5",
    purple: "border-purple-500 bg-purple-500/5",
    blue: "border-blue-500 bg-blue-500/5",
  }

  const handleSelectPackage = () => {
    onPackageSelect(pkg)
  }

  return (
    <Card
      className={`relative transition-all duration-300 hover:scale-105 hover:shadow-lg ${
        pkg.popular ? `${colorClasses[pkg.color]} shadow-lg` : "border-slate-200 dark:border-white/10"
      } bg-white/50 dark:bg-slate-800/50 backdrop-blur`}
    >
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1">
            <Star className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
          <Wifi className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">{pkg.name}</CardTitle>
        <p className="text-slate-600 dark:text-slate-400">{pkg.description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price */}
        <div className="text-center">
          <div className="text-4xl font-bold text-slate-900 dark:text-white">
            Ksh {pkg.price}
            <span className="text-lg font-normal text-slate-600 dark:text-slate-400">/{pkg.duration}</span>
          </div>
        </div>

        {/* Speed & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50">
            <Zap className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">{pkg.speed}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Speed</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50">
            <Clock className="w-5 h-5 mx-auto mb-1 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">{pkg.duration}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Duration</p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-white">What's included:</h4>
          <ul className="space-y-2">
            {pkg.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleSelectPackage}
          className={`w-full h-12 font-semibold transition-all duration-300 ${
            pkg.popular
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
          }`}
        >
          Pay with M-Pesa - Ksh {pkg.price}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}

export default function PackagesPage() {
  const [phone, setPhone] = useState("")
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [status, setStatus] = useState<"pending" | "completed" | "failed" | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const [macAddress, setMacAddress] = useState("Loading...")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)

  useEffect(() => {
    fetchDeviceInfo()
  }, [])

  const fetchDeviceInfo = async () => {
    try {
      toast.info("Fetching device information...", { duration: 2000 })

      const response = await apiClient.getDeviceInfo()

      if (response.success && response.data) {
        setMacAddress(response.data.macAddress)
        toast.success("Device information loaded", { duration: 2000 })
      } else {
        throw new Error(response.error || "Failed to fetch device info")
      }
    } catch (error) {
      console.error("Error fetching device info:", error)
      setMacAddress("UNAVAILABLE")
      toast.error("Could not retrieve device information", {
        description: "Please refresh the page and try again",
      })
    }
  }

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg)
    setShowPaymentModal(true)
  }

  const handlePayment = async () => {
    // Validation
    if (!/^(07|01)\d{8}$/.test(phone)) {
      toast.error("Invalid phone number", {
        description: "Please enter a valid 10-digit phone number starting with 07 or 01",
      })
      return
    }

    if (!selectedPackage) {
      toast.error("No package selected", {
        description: "Please select a package before proceeding",
      })
      return
    }

    setIsLoading(true)
    setStatus("pending")

    toast.loading("Initiating M-Pesa payment...", {
      description: `Ksh ${selectedPackage.price} for ${selectedPackage.name}`,
      id: "payment-loading",
    })

    try {
      const paymentPayload: PaymentRequest = {
        phone: `+254${phone.substring(1)}`,
        amount: selectedPackage.price,
        package: selectedPackage.name,
        macAddress,
        speed: selectedPackage.speed,
      }

      console.log("Payment payload:", paymentPayload)

      const response = await apiClient.initiatePayment(paymentPayload)

      if (response.success && response.data) {
        const { transactionId: txnId, mpesaRef, status: paymentStatus, expiresAt } = response.data

        setTransactionId(txnId)
        setStatus(paymentStatus)

        if (paymentStatus === "completed") {
          const successPaymentData = {
            transactionId: txnId,
            amount: selectedPackage.price,
            package: selectedPackage.name,
            phone: `+254${phone.substring(1)}`,
            mpesaRef,
            expiresAt,
            speed: selectedPackage.speed,
          }

          setPaymentData(successPaymentData)

          toast.dismiss("payment-loading")
          toast.success("Payment successful!", {
            description: "You are now connected to the internet",
            duration: 4000,
          })

          setTimeout(() => {
            setShowPaymentModal(false)
          }, 1000)
        } else if (paymentStatus === "pending") {
          // Poll for payment status
          pollPaymentStatus(txnId)
        }
      } else {
        throw new Error(response.error || "Payment initiation failed")
      }
    } catch (error) {
      setStatus("failed")
      toast.dismiss("payment-loading")
      const errMsg = error instanceof Error ? error.message : String(error)
      toast.error("Payment error", {
        description: errMsg || "An unexpected error occurred. Please try again.",
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const pollPaymentStatus = async (txnId: string) => {
    const maxAttempts = 30 // 5 minutes with 10-second intervals
    let attempts = 0

    const poll = async () => {
      try {
        const response = await apiClient.checkPaymentStatus(txnId)

        if (response.success && response.data) {
          const { status: paymentStatus, mpesaRef, expiresAt } = response.data

          if (paymentStatus === "completed") {
            const successPaymentData = {
              transactionId: txnId,
              amount: selectedPackage.price,
              package: selectedPackage.name,
              phone: `+254${phone.substring(1)}`,
              mpesaRef,
              expiresAt,
              speed: selectedPackage.speed,
            }

            setPaymentData(successPaymentData)
            setStatus("completed")

            toast.dismiss("payment-loading")
            toast.success("Payment successful!", {
              description: "You are now connected to the internet",
              duration: 4000,
            })

            setTimeout(() => {
              setShowPaymentModal(false)
            }, 1000)
            return
          } else if (paymentStatus === "failed") {
            setStatus("failed")
            toast.dismiss("payment-loading")
            toast.error("Payment failed", {
              description: "Please check your M-Pesa balance and try again",
              duration: 4000,
            })
            return
          }
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000) // Poll every 10 seconds
        } else {
          setStatus("failed")
          toast.dismiss("payment-loading")
          toast.error("Payment timeout", {
            description: "Payment is taking longer than expected. Please contact support.",
            duration: 4000,
          })
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error)
        console.error("Error polling payment status:", errMsg)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000)
        }
      }
    }

    poll()
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPhone(value)

    // Real-time validation feedback
    if (value && !/^(07|01)\d{0,8}$/.test(value)) {
      toast.error("Invalid format", {
        description: "Phone number should start with 07 or 01",
        duration: 2000,
      })
    }
  }

  return (
    <>
      <ToastProvider />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Choose Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Perfect Package
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Select from our range of affordable internet packages designed to meet your specific needs. All packages
              include secure M-Pesa payment and instant activation.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">10,000+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">99.9%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Support</div>
              </div>
            </div>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onPackageSelect={handlePackageSelect} />
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How do I pay?</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Simply select your package and pay using M-Pesa. You'll receive instant access once payment is
                    confirmed.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Is there a data limit?</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    No, all our packages offer unlimited data usage during the specified time period.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Can I extend my session?</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Yes, you can purchase additional time before your current session expires.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What if I have issues?</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Our support team is available 24/7 to help you with any connectivity or payment issues.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Get Connected?</h3>
                <p className="mb-6 opacity-90">
                  Join thousands of satisfied customers enjoying fast, reliable internet access.
                </p>
                <Link href="/">
                  <Button className="bg-white text-blue-600 hover:bg-slate-100 font-semibold px-8 py-3">
                    Get Started Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />

        {/* Payment Modal */}
        {showPaymentModal && selectedPackage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Complete Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selected Package Info */}
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <h3 className="font-semibold text-lg">{selectedPackage.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    Ksh {selectedPackage.price}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedPackage.duration} • {selectedPackage.speed}
                  </p>
                </div>

                {/* Phone Input */}
                <div className="space-y-2">
                  <Label htmlFor="modal-phone" className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    M-Pesa Number
                  </Label>
                  <Input
                    id="modal-phone"
                    type="tel"
                    placeholder="0712 345 678"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="bg-white/50 dark:bg-slate-700/50"
                    maxLength={10}
                  />
                </div>

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={isLoading || !phone || phone.length !== 10}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Pay with M-Pesa - Ksh {selectedPackage.price}
                    </>
                  )}
                </Button>

                {/* Status Display */}
                {status && (
                  <div className="text-center">
                    {status === "pending" && (
                      <p className="text-yellow-600 dark:text-yellow-400">Processing payment...</p>
                    )}
                    {status === "completed" && (
                      <p className="text-green-600 dark:text-green-400">Payment successful!</p>
                    )}
                    {status === "failed" && (
                      <p className="text-red-600 dark:text-red-400">Payment failed. Please try again.</p>
                    )}
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success Modal */}
        {paymentData && (
          <PaymentSuccessModal
            isOpen={true}
            onClose={() => {
              setPaymentData(null)
              setShowPaymentModal(false)
              setSelectedPackage(null)
              setPhone("")
              setStatus("")
            }}
            paymentData={paymentData}
          />
        )}
      </div>
    </>
  )
}
