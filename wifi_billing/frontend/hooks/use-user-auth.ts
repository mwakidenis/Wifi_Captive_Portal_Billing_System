import { useState, useEffect } from 'react'

interface User {
  id: number
  email: string
  name: string
  phone: string
}

interface UserAuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  loading: boolean
}

export function useUserAuth() {
  const [authState, setAuthState] = useState<UserAuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  })

  // Logout function
  const logout = () => {
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_data')
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
    })
  }

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('user_token')
    const userData = localStorage.getItem('user_data')

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        setAuthState({
          isAuthenticated: true,
          user,
          token,
          loading: false,
        })
      } catch (error) {
        console.error('Error parsing user data:', error)
        logout()
      }
    } else {
      setAuthState((prev) => ({ ...prev, loading: false }))
    }
  }, [])

  // Login function
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()

      // Check if admin login (has redirectTo)
      if (data.redirectTo === '/admin') {
        // Store admin auth data
        localStorage.setItem('admin_token', data.data.token)
        localStorage.setItem('admin_data', JSON.stringify(data.data.user))

        // Redirect to admin panel
        window.location.href = '/admin'
        return { success: true, isAdmin: true }
      }

      // Store regular user auth data
      localStorage.setItem('user_token', data.data.token)
      localStorage.setItem('user_data', JSON.stringify(data.data.user))

      setAuthState({
        isAuthenticated: true,
        user: data.data.user,
        token: data.data.token,
        loading: false,
      })

      return { success: true, isAdmin: false }
    } catch (error: any) {
      console.error('Login failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Signup function
  const signup = async (name: string, email: string, phone: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.errors) {
          throw new Error(errorData.errors.map((err: any) => err.msg).join(', '))
        }
        throw new Error(errorData.error || 'Signup failed')
      }

      const data = await response.json()

      // Store auth data
      localStorage.setItem('user_token', data.token)
      localStorage.setItem('user_data', JSON.stringify(data.user))

      setAuthState({
        isAuthenticated: true,
        user: data.user,
        token: data.token,
        loading: false,
      })

      return { success: true }
    } catch (error: any) {
      console.error('Signup failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Get auth headers for API calls
  const getAuthHeaders = () => {
    if (!authState.token) return {}
    return { Authorization: `Bearer ${authState.token}` }
  }

  return {
    ...authState,
    login,
    signup,
    logout,
    getAuthHeaders,
  }
}