"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import api from "../services/api"

interface User {
  id: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  roles: string[]
  emailVerified: boolean
  twoFactorEnabled: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<{ requiresTwoFactor: boolean; userId?: number }>
  verifyTwoFactor: (userId: number, code: string) => Promise<void>
  register: (username: string, email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  resendVerificationEmail: (email: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  enableTwoFactor: () => Promise<{ secret: string; qrCodeUrl: string }>
  disableTwoFactor: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  login: async () => ({ requiresTwoFactor: false }),
  verifyTwoFactor: async () => {},
  register: async () => {},
  logout: () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  resendVerificationEmail: async () => {},
  updateProfile: async () => {},
  changePassword: async () => {},
  enableTwoFactor: async () => ({ secret: "", qrCodeUrl: "" }),
  disableTwoFactor: async () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`
          const response = await api.get("/api/users/me")
          setUser(response.data)
        } catch (error) {
          console.error("Error loading user:", error)
          localStorage.removeItem("token")
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [token])

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post("/api/auth/login", { username, password })

      // Check if 2FA is required
      if (response.data.requiresTwoFactor) {
        return { requiresTwoFactor: true, userId: response.data.userId }
      }

      const { token: newToken, ...userData } = response.data

      localStorage.setItem("token", newToken)
      setToken(newToken)
      setUser(userData)
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`

      return { requiresTwoFactor: false }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const verifyTwoFactor = async (userId: number, code: string) => {
    try {
      const response = await api.post("/api/auth/verify-2fa", { userId, code })

      const { token: newToken, ...userData } = response.data

      localStorage.setItem("token", newToken)
      setToken(newToken)
      setUser(userData)
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`
    } catch (error) {
      console.error("Two-factor verification error:", error)
      throw error
    }
  }

  const register = async (username: string, email: string, password: string, firstName: string, lastName: string) => {
    try {
      await api.post("/api/auth/register", {
        username,
        email,
        password,
        firstName,
        lastName,
        roles: ["user"],
      })
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    delete api.defaults.headers.common["Authorization"]
  }

  const forgotPassword = async (email: string) => {
    try {
      await api.post("/api/auth/forgot-password", { email })
    } catch (error) {
      console.error("Forgot password error:", error)
      throw error
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await api.post("/api/reset-password", { token, newPassword })
    } catch (error) {
      console.error("Reset password error:", error)
      throw error
    }
  }

  const resendVerificationEmail = async (email: string) => {
    try {
      await api.post("/api/verify/resend", email)
    } catch (error) {
      console.error("Resend verification email error:", error)
      throw error
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.put("/api/users/me", data)
      setUser({ ...user, ...response.data })
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await api.post("/api/users/change-password", { currentPassword, newPassword })
    } catch (error) {
      console.error("Change password error:", error)
      throw error
    }
  }

  const enableTwoFactor = async () => {
    try {
      const response = await api.post("/api/auth/enable-2fa")
      return response.data
    } catch (error) {
      console.error("Enable two-factor error:", error)
      throw error
    }
  }

  const disableTwoFactor = async () => {
    try {
      await api.post("/api/auth/disable-2fa")
    } catch (error) {
      console.error("Disable two-factor error:", error)
      throw error
    }
  }

  const isAuthenticated = !!user
  const isAdmin =
    Array.isArray(user?.roles) &&
    user.roles.some(
      (role: any) =>
        role === "ROLE_ADMIN" ||
        (typeof role === "object" && role.name === "ROLE_ADMIN")
    )

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        verifyTwoFactor,
        register,
        logout,
        forgotPassword,
        resetPassword,
        resendVerificationEmail,
        updateProfile,
        changePassword,
        enableTwoFactor,
        disableTwoFactor,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
