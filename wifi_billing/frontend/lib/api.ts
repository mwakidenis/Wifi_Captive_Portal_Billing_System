// API configuration optimized for Node.js/Express backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Daraja Mpesa API base URL
export const DARAJA_API_BASE_URL = "http://localhost:3000"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaymentRequest {
  phone: string
  amount: number
  package: string
  macAddress: string
  speed: string
}

export interface PaymentResponse {
  transactionId: string
  mpesaRef: string
  status: "pending" | "completed" | "failed"
  expiresAt: string | null
}

export interface User {
  id: number
  phone: string
  macAddress: string
  status: "active" | "expired" | "blocked"
  currentPackage?: string
  expiresAt?: string
  totalSpent: number
  sessionsCount: number
  lastSeen: string
}

export interface Transaction {
  id: string
  phone: string
  amount: number
  package: string
  status: "completed" | "failed" | "pending" | "refunded"
  timestamp: string
  mpesaRef: string
  mpesaReceipt?: string
}

export interface SystemStats {
  totalUsers: number
  activeUsers: number
  todayRevenue: number
  successRate: number
  pendingPayments: number
  blockedUsers: number
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      // Get auth token for protected routes
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "API request failed")
      }

      return data
    } catch (error) {
      console.error("API Error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Device & Network APIs
  async getDeviceInfo(): Promise<ApiResponse<{ macAddress: string; ipAddress: string; deviceId: string }>> {
    return this.request("/api/device/info")
  }

  async registerDevice(macAddress: string): Promise<ApiResponse<{ deviceId: string }>> {
    return this.request("/api/device/register", {
      method: "POST",
      body: JSON.stringify({ macAddress }),
    })
  }

  // Payment APIs
  async initiatePayment(paymentData: PaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    // Use the backend API instead of Daraja directly
    try {
      const response = await fetch(`${API_BASE_URL}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          phone: paymentData.phone,
          amount: paymentData.amount.toString()
        }).toString(),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Payment initiation failed")
      }

      // Transform response to match expected format
      return {
        success: true,
        data: {
          transactionId: `TXN_${Date.now()}`,
          mpesaRef: data.data?.CheckoutRequestID || data.data?.MerchantRequestID || null,
          status: "pending",
          expiresAt: null,
        },
        message: data.message || "STK Push sent!",
      }
    } catch (error) {
      console.error("Payment API Error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<ApiResponse<PaymentResponse>> {
    return this.request(`/api/payments/status/${transactionId}`)
  }

  async getPaymentHistory(phone: string): Promise<ApiResponse<Transaction[]>> {
    // Optional: can be implemented later via /api/transactions?search=phone
    const resp = await this.getTransactions({ search: phone, limit: 100 })
    if (!resp.success || !resp.data) return { success: false, error: resp.error }
    return { success: true, data: resp.data.transactions }
  }

  // User Management APIs
  async getUsers(params?: {
    search?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ users: User[]; total: number; page: number; totalPages: number }>> {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append("search", params.search)
    if (params?.status && params.status !== "all") queryParams.append("status", params.status)
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    return this.request(`/api/users?${queryParams.toString()}`)
  }

  async getUserDetails(userId: number): Promise<ApiResponse<User & { transactions: Transaction[] }>> {
    return this.request(`/api/users/${userId}`)
  }

  async blockUser(userId: number): Promise<ApiResponse> {
    return this.request(`/api/users/${userId}/block`, { method: "POST" })
  }

  async unblockUser(userId: number): Promise<ApiResponse> {
    return this.request(`/api/users/${userId}/unblock`, { method: "POST" })
  }

  async deleteUser(userId: number): Promise<ApiResponse> {
    return this.request(`/api/users/${userId}`, { method: "DELETE" })
  }

  async disconnectUser(userId: number): Promise<ApiResponse> {
    return this.request(`/api/users/${userId}/disconnect`, { method: "POST" })
  }

  // Transaction APIs
  async getTransactions(params?: {
    search?: string
    status?: string
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<{ transactions: Transaction[]; total: number; page: number; totalPages: number }>> {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append("search", params.search)
    if (params?.status && params.status !== "all") queryParams.append("status", params.status)
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.startDate) queryParams.append("startDate", params.startDate)
    if (params?.endDate) queryParams.append("endDate", params.endDate)
    return this.request(`/api/transactions?${queryParams.toString()}`)
  }

  async refundTransaction(transactionId: string, reason?: string): Promise<ApiResponse> {
    return this.request(`/api/transactions/${transactionId}/refund`, { method: "POST", body: JSON.stringify({ reason }) })
  }

  async downloadReceipt(transactionId: string): Promise<ApiResponse<{ receiptUrl: string }>> {
    return this.request(`/api/transactions/${transactionId}/receipt`)
  }

  // Auth APIs
  async register(data: {
    username: string
    email?: string
    phone: string
    password: string
  }): Promise<ApiResponse<{
    user: { id: number; username: string; email: string | null; phone: string }
    token: string
  }>> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async login(data: { username: string; password: string }): Promise<ApiResponse<{
    user: { id: number; username: string; email: string | null; phone: string }
    token: string
  }>> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Support APIs
  async submitSupportRequest(data: {
    name: string
    phone: string
    transactionCode: string
    message: string
  }): Promise<ApiResponse> {
    return this.request("/api/support/submit", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getSupportRequests(params?: {
    status?: string
    page?: number
    limit?: number
    search?: string
  }): Promise<ApiResponse<{ requests: any[]; total: number; page: number; totalPages: number }>> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append("status", params.status)
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.search) queryParams.append("search", params.search)
    return this.request(`/api/support/requests?${queryParams.toString()}`)
  }

  async updateSupportRequestStatus(id: number, status: string): Promise<ApiResponse> {
    return this.request(`/api/support/requests/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  }

  async getSupportRequest(id: number): Promise<ApiResponse<any>> {
    return this.request(`/api/support/requests/${id}`)
  }

  async getUserSupportRequests(phone: string): Promise<ApiResponse<any[]>> {
    return this.request(`/api/support/user/requests?phone=${encodeURIComponent(phone)}`)
  }

  // System APIs
  async getSystemStats(): Promise<ApiResponse<SystemStats>> {
    const resp = await this.request<any>("/api/admin/summary")
    if (!resp.success || !resp.data) {
      return { success: false, error: resp.error || "Failed to load stats" }
    }
    const data = resp.data as any
    const mapped: SystemStats = {
      totalUsers: Number(data.totalUsers) || 0,
      activeUsers: Number(data.activeSessions) || 0,
      todayRevenue: Number(data.totalRevenue) || 0,
      successRate: 0,
      pendingPayments: Number(data.pendingPayments) || 0,
      blockedUsers: 0,
    }
    return { success: true, data: mapped }
  }

  async getSystemSettings(): Promise<ApiResponse<any>> {
    return { success: true, data: { } }
  }

  async updateSystemSettings(settings: any): Promise<ApiResponse> {
    return { success: true }
  }

  async restartNetworkService(): Promise<ApiResponse> {
    return { success: false, error: "Not implemented" }
  }

  async backupDatabase(): Promise<ApiResponse<{ backupFile: string }>> {
    return { success: false, error: "Not implemented" }
  }

  async getSystemLogs(params?: { level?: string; limit?: number }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.level) queryParams.append("level", params.level)
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    return this.request(`/api/system/logs?${queryParams.toString()}`)
  }

  // Network Management APIs
  async getConnectedDevices(): Promise<ApiResponse<any[]>> {
    return this.request("/api/network/devices")
  }

  async disconnectAllUsers(): Promise<ApiResponse> {
    return this.request("/api/network/disconnect-all", { method: "POST" })
  }

  async getNetworkStatus(): Promise<ApiResponse<{ status: string; uptime: number; connectedUsers: number }>> {
    return this.request("/api/network/status")
  }
}

export const apiClient = new ApiClient()

// WebSocket connection for real-time updates
export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 5000
  private phone: string | null = null

  connect(phone?: string) {
    this.phone = phone || null
    const wsUrl = `${API_BASE_URL.replace("http", "ws")}/ws`

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log("WebSocket connected")
        this.reconnectAttempts = 0
        // Emit connection status event
        window.dispatchEvent(new CustomEvent("websocket_connected", { detail: { connected: true } }))
        // Subscribe to support updates for this phone
        if (this.phone) {
          this.send({ type: "subscribe", phone: this.phone })
        }
      }

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      }

      this.ws.onclose = () => {
        console.log("WebSocket disconnected")
        // Emit disconnection status event
        window.dispatchEvent(new CustomEvent("websocket_connected", { detail: { connected: false } }))
        this.reconnect()
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error)
      }
    } catch (error) {
      console.error("Failed to connect WebSocket:", error)
    }
  }

  private handleMessage(data: any) {
    // Emit custom events for different message types
    if (data.type === "payment_status") {
      window.dispatchEvent(
        new CustomEvent("payment_status_update", {
          detail: data.payload,
        }),
      )
    } else if (data.type === "user_connected") {
      window.dispatchEvent(
        new CustomEvent("user_connected", {
          detail: data.payload,
        }),
      )
    } else if (data.type === "user_disconnected") {
      window.dispatchEvent(
        new CustomEvent("user_disconnected", {
          detail: data.payload,
        }),
      )
    } else if (data.type === "support_request_update") {
      window.dispatchEvent(
        new CustomEvent("support_request_update", {
          detail: data.payload,
        }),
      )
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect(this.phone || undefined)
      }, this.reconnectInterval)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
}

export const wsClient = new WebSocketClient()
