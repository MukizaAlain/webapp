"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import api from "../services/api"

const VerifyEmail = () => {
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const location = useLocation()

  useEffect(() => {
    const verifyEmail = async () => {
      const queryParams = new URLSearchParams(location.search)
      const token = queryParams.get("token")

      if (!token) {
        setError("No verification token provided")
        setVerifying(false)
        return
      }

      try {
        // Update this line to match your backend endpoint
        await api.get(`/verify-email?token=${token}`)
        setSuccess(true)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to verify email")
      } finally {
        setVerifying(false)
      }
    }

    verifyEmail()
  }, [location.search])

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Verifying your email...</h2>
          <p>Please wait while we verify your email address.</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Email Verified!</h2>
          <p className="mb-4">Your email has been successfully verified. You can now log in to your account.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
        <p className="mb-4">{error}</p>
        <p className="mb-4">
          The verification link may have expired or is invalid. Please request a new verification email.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}

export default VerifyEmail
