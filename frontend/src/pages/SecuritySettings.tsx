"use client"

import { useState, useContext, useEffect } from "react"
import AuthContext from "../context/AuthContext"
import { QrCode } from "lucide-react"

const SecuritySettings = () => {
  const { user, enableTwoFactor, disableTwoFactor } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [secret, setSecret] = useState("")
  const [showQrCode, setShowQrCode] = useState(false)

  useEffect(() => {
    // Reset state when user changes
    setShowQrCode(false)
    setQrCodeUrl("")
    setSecret("")
    setMessage("")
    setError("")
  }, [user])

  const handleEnableTwoFactor = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const result = await enableTwoFactor()
      setSecret(result.secret)
      setQrCodeUrl(result.qrCodeUrl)
      setShowQrCode(true)
      setMessage("Two-factor authentication has been enabled. Scan the QR code with your authenticator app.")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to enable two-factor authentication")
    } finally {
      setLoading(false)
    }
  }

  const handleDisableTwoFactor = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      await disableTwoFactor()
      setShowQrCode(false)
      setMessage("Two-factor authentication has been disabled.")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to disable two-factor authentication")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Security Settings</h1>

      {message && <div className="mb-4 p-4 rounded bg-green-100 text-green-700">{message}</div>}

      {error && <div className="mb-4 p-4 rounded bg-red-100 text-red-700">{error}</div>}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h2>

          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Two-factor authentication adds an extra layer of security to your account by requiring a verification code
              in addition to your password.
            </p>
            <p className="text-gray-600 mb-4">
              {user?.twoFactorEnabled
                ? "Two-factor authentication is currently enabled for your account."
                : "Two-factor authentication is currently disabled for your account."}
            </p>

            {showQrCode && (
              <div className="mb-6 p-4 border rounded-md">
                <h3 className="font-medium mb-2">Setup Instructions:</h3>
                <ol className="list-decimal list-inside mb-4 text-gray-600">
                  <li>Download an authenticator app like Google Authenticator or Authy</li>
                  <li>Scan the QR code below with your app</li>
                  <li>Enter the 6-digit code from your app when logging in</li>
                </ol>

                <div className="flex flex-col items-center mb-4">
                  <div className="bg-white p-4 rounded-md border mb-2">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-48 h-48" />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center bg-gray-100">
                        <QrCode className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {secret && (
                    <div className="text-sm text-gray-600">
                      <p className="mb-1">If you can't scan the QR code, enter this code manually:</p>
                      <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4">
              {user?.twoFactorEnabled ? (
                <button
                  onClick={handleDisableTwoFactor}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
                >
                  {loading ? "Disabling..." : "Disable Two-Factor Authentication"}
                </button>
              ) : (
                <button
                  onClick={handleEnableTwoFactor}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {loading ? "Enabling..." : "Enable Two-Factor Authentication"}
                </button>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Password Security</h2>
            <p className="text-gray-600 mb-4">
              It's recommended to use a strong, unique password and change it periodically.
            </p>
            <button
              onClick={() => (window.location.href = "/forgot-password")}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecuritySettings
