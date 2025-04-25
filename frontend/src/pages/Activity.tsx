"use client"

import { useState, useEffect } from "react"
import api from "../services/api"
import { Calendar, Clock, Filter } from "lucide-react"

interface Activity {
  id: number
  activityType: string
  description: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

const Activity = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filter, setFilter] = useState("")

  useEffect(() => {
    fetchActivities()
  }, [page, filter])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "10",
      })

      if (filter) {
        params.append("type", filter)
      }

      const response = await api.get(`/api/activities/me/all?${params.toString()}`)
      setActivities(response.data.content)
      setTotalPages(response.data.totalPages)
    } catch (err) {
      console.error("Error fetching activities:", err)
      setError("Failed to load activities")

      // Fallback to mock data if API fails
      setActivities([
        {
          id: 1,
          activityType: "LOGIN",
          description: "User logged in",
          timestamp: new Date().toISOString(),
          ipAddress: "192.168.1.1",
        },
        {
          id: 2,
          activityType: "PROFILE_UPDATE",
          description: "User updated profile",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          ipAddress: "192.168.1.1",
        },
      ])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "LOGIN":
      case "LOGOUT":
        return <Clock className="h-5 w-5" />
      case "PROFILE_UPDATE":
      case "PASSWORD_CHANGE":
        return <Calendar className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "LOGIN":
        return "bg-green-100 text-green-600"
      case "LOGOUT":
        return "bg-red-100 text-red-600"
      case "PROFILE_UPDATE":
        return "bg-blue-100 text-blue-600"
      case "PASSWORD_CHANGE":
        return "bg-purple-100 text-purple-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading && activities.length === 0) {
    return <div className="flex justify-center items-center h-full">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Activity History</h1>

        <div className="relative">
          <select
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value)
              setPage(0)
            }}
          >
            <option value="">All Activities</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="PROFILE_UPDATE">Profile Update</option>
            <option value="PASSWORD_CHANGE">Password Change</option>
          </select>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {activities.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <div key={activity.id} className="p-6">
                <div className="flex items-start">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.activityType)} mt-1`}>
                    {getActivityIcon(activity.activityType)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{activity.description}</h3>
                      <span className="text-sm text-gray-500">{formatDate(activity.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Activity Type: {activity.activityType}</p>
                    {activity.ipAddress && (
                      <p className="mt-1 text-xs text-gray-500">IP Address: {activity.ipAddress}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No activity found.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Activity
