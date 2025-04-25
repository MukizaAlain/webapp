"use client"

import { useState, useContext } from "react"
import { Bell, Shield, Eye, EyeOff } from "lucide-react"
import AuthContext from "../context/AuthContext"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "../components/ui/dialog"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../components/ui/alert-dialog"

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [activityAlerts, setActivityAlerts] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(true)
  const [showApiKey, setShowApiKey] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const { enableTwoFactor, disableTwoFactor, user } = useContext(AuthContext)
  const [twoFactorMessage, setTwoFactorMessage] = useState("")
  const [twoFactorError, setTwoFactorError] = useState("")
  const [twoFactorSecret, setTwoFactorSecret] = useState("")
  const [twoFactorQr, setTwoFactorQr] = useState("")
  const [loading2fa, setLoading2fa] = useState(false)
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false)

  const handleSaveNotifications = () => {
    // In a real app, you would save these settings to the backend
    setMessage({
      type: "success",
      text: "Notification settings saved successfully",
    })

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage({ type: "", text: "" })
    }, 3000)
  }

  const handleEnableTwoFactor = async () => {
    setTwoFactorMessage("")
    setTwoFactorError("")
    setLoading2fa(true)
    try {
      const result = await enableTwoFactor()
      setTwoFactorMessage("Two-factor authentication enabled. Check your email for the code or scan the QR code below.")
      if (result.secret) setTwoFactorSecret(result.secret)
      if (result.qrCodeUrl) setTwoFactorQr(result.qrCodeUrl)
    } catch (err: any) {
      setTwoFactorError(err.response?.data?.message || "Failed to enable two-factor authentication")
    } finally {
      setLoading2fa(false)
    }
  }

  const handleDisableTwoFactor = async () => {
    setTwoFactorMessage("")
    setTwoFactorError("")
    setLoading2fa(true)
    try {
      await disableTwoFactor()
      setTwoFactorMessage("Two-factor authentication has been disabled.")
      setTwoFactorSecret("")
      setTwoFactorQr("")
    } catch (err: any) {
      setTwoFactorError(err.response?.data?.message || "Failed to disable two-factor authentication")
    } finally {
      setLoading2fa(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      {message.text && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Notification Settings */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-blue-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800">Notification Settings</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                  id="emailNotifications"
                  title="Email Notifications"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Activity Alerts</h3>
                <p className="text-sm text-gray-500">Get notified about account activity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={activityAlerts}
                  onChange={() => setActivityAlerts(!activityAlerts)}
                  id="activityAlerts"
                  title="Activity Alerts"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Security Alerts</h3>
                <p className="text-sm text-gray-500">Receive alerts for suspicious activity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={securityAlerts}
                  onChange={() => setSecurityAlerts(!securityAlerts)}
                  id="securityAlerts"
                  title="Security Alerts"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="pt-5">
              <button
                type="button"
                onClick={handleSaveNotifications}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Notification Settings
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800">Security Settings</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900">API Key</h3>
              <p className="text-sm text-gray-500 mb-2">Your API key for accessing the application</p>
              <div className="flex items-center">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? "text" : "password"}
                    readOnly
                    value="sk_test_51NzT7XLkjhgT6G8H9JKL3M4N5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0"
                    className="pr-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Regenerate
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500 mb-2">Add an extra layer of security to your account</p>
              {twoFactorMessage && (
                <div className="mb-2 p-2 rounded bg-green-100 text-green-700">{twoFactorMessage}</div>
              )}
              {twoFactorError && (
                <div className="mb-2 p-2 rounded bg-red-100 text-red-700">{twoFactorError}</div>
              )}
              {twoFactorQr && (
                <div className="mb-2"><img src={twoFactorQr} alt="2FA QR Code" className="w-40 h-40 mx-auto" /></div>
              )}
              {twoFactorSecret && (
                <div className="mb-2 text-sm text-gray-700">Secret: <code className="bg-gray-100 px-2 py-1 rounded">{twoFactorSecret}</code></div>
              )}
              {user?.twoFactorEnabled ? (
                <>
                  <AlertDialog open={showDisable2FAModal} onOpenChange={setShowDisable2FAModal}>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        disabled={loading2fa}
                      >
                        {loading2fa ? "Disabling..." : "Disable Two-Factor Authentication"}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Disable Two-Factor Authentication</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to disable two-factor authentication? This will make your account less secure.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction asChild>
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            onClick={async () => {
                              setShowDisable2FAModal(false)
                              await handleDisableTwoFactor()
                            }}
                            disabled={loading2fa}
                          >
                            Yes, Disable
                          </button>
                        </AlertDialogAction>
                        <AlertDialogCancel asChild>
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancel
                          </button>
                        </AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleEnableTwoFactor}
                  disabled={loading2fa}
                >
                  {loading2fa ? "Enabling..." : "Enable Two-Factor Authentication"}
                </button>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900">Session Management</h3>
              <p className="text-sm text-gray-500 mb-2">Manage your active sessions</p>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Active Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
