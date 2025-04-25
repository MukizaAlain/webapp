"use client"

import type React from "react"

import { useState, useContext, useEffect } from "react"
import AuthContext from "../context/AuthContext"

const Profile = () => {
  const { user, updateProfile, changePassword } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [message, setMessage] = useState({ type: "", text: "" })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })
    setLoading(true)

    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      })

      setMessage({ type: "success", text: "Profile updated successfully" })
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" })
      return
    }

    setLoading(true)

    try {
      await changePassword(formData.currentPassword, formData.newPassword)

      setMessage({ type: "success", text: "Password changed successfully" })

      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to change password",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h1>

      {message.text && (
        <div
          className={`mb-4 p-4 rounded ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "password"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Change Password
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "profile" ? (
            <form onSubmit={handleProfileSubmit}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                  <p className="mt-1 text-sm text-gray-500">Update your personal details.</p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          firstName: user?.firstName || "",
                          lastName: user?.lastName || "",
                          email: user?.email || "",
                        })
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
                  <p className="mt-1 text-sm text-gray-500">Update your password.</p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Current password
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        required
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New password
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        required
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm new password
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        })
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {loading ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
