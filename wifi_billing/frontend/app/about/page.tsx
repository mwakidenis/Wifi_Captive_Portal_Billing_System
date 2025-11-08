"use client"

import { Wifi, Users, Shield, Zap, Globe, Award, Heart, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ToastProvider } from "@/components/toast-provider"
import { useDynamicTitle } from "@/hooks/use-dynamic-title"

const teamMembers = [
  {
    name: "John Kamau",
    role: "Founder & CEO",
    image: "/placeholder.svg?height=200&width=200",
    description: "10+ years in telecommunications and network infrastructure.",
  },
  {
    name: "Sarah Wanjiku",
    role: "CTO",
    image: "/placeholder.svg?height=200&width=200",
    description: "Expert in network security and system architecture.",
  },
  {
    name: "David Ochieng",
    role: "Head of Operations",
    image: "/placeholder.svg?height=200&width=200",
    description: "Ensures 99.9% uptime and exceptional customer experience.",
  },
]

const values = [
  {
    icon: Shield,
    title: "Security First",
    description: "We prioritize the security and privacy of our users' data and transactions.",
  },
  {
    icon: Zap,
    title: "Speed & Reliability",
    description: "Delivering consistent high-speed internet with minimal downtime.",
  },
  {
    icon: Heart,
    title: "Customer Focus",
    description: "Our customers are at the heart of everything we do.",
  },
  {
    icon: Target,
    title: "Innovation",
    description: "Continuously improving our services with the latest technology.",
  },
]

const stats = [
  { number: "10,000+", label: "Active Users" },
  { number: "99.9%", label: "Uptime" },
  { number: "24/7", label: "Support" },
  { number: "5+", label: "Years Experience" },
]

export default function AboutPage() {
  useDynamicTitle("About Us")
  return (
    <>
      <ToastProvider />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-8">
              <Wifi className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              About
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Qonnect WiFi
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              We're on a mission to provide fast, reliable, and affordable internet access to everyone. Founded in 2019,
              Powerbeam WiFi has grown to serve thousands of customers across Kenya.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 text-center"
              >
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat.number}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Story Section */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Our Story</h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                  Powerbeam WiFi was born from a simple observation: internet access in Kenya was either too expensive or
                  too unreliable for many people. Our founders, having worked in the telecommunications industry for
                  over a decade, decided to change that.
                </p>
                <p>
                  Starting with a single hotspot in Nairobi, we've grown to serve over 10,000 customers across multiple
                  locations. Our success is built on three pillars: affordable pricing, reliable service, and
                  exceptional customer support.
                </p>
                <p>
                  Today, we're proud to be one of Kenya's leading WiFi service providers, known for our innovative
                  M-Pesa integration and commitment to digital inclusion.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="Powerbeam WiFi Office"
                className="rounded-lg shadow-lg w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800/30">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center">
                  <Target className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  To democratize internet access by providing fast, reliable, and affordable WiFi services that empower
                  individuals and businesses to thrive in the digital age.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800/30">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  To be the leading WiFi service provider in East Africa, known for innovation, reliability, and
                  exceptional customer experience.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 text-center"
                >
                  <CardContent className="p-6">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{value.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 text-center hover:scale-105 transition-transform">
                <CardContent className="p-8">
                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kaaria Denis</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold mb-4">CEO & Founder</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Visionary leader driving innovation in WiFi connectivity solutions across Kenya.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 text-center hover:scale-105 transition-transform">
                <CardContent className="p-8">
                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mb-6">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mathew Kioko</h3>
                  <p className="text-green-600 dark:text-green-400 font-semibold mb-4">CTO</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Technical expert overseeing system architecture and cutting-edge technology implementation.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 text-center hover:scale-105 transition-transform">
                <CardContent className="p-8">
                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nehemiah Benjamin</h3>
                  <p className="text-purple-600 dark:text-purple-400 font-semibold mb-4">Operations Manager</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Ensures smooth operations and exceptional customer experience across all services.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Awards & Recognition */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Awards & Recognition</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800/30">
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 mx-auto mb-4 text-yellow-600 dark:text-yellow-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Best WiFi Service 2023</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Kenya Tech Awards</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800/30">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Customer Choice Award</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Digital Kenya 2022</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800/30">
                <CardContent className="p-6 text-center">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Innovation in Connectivity</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">East Africa Tech Summit 2021</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
