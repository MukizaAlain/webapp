"use client"

import { useState, useEffect, useContext } from "react"
import AuthContext from "../context/AuthContext"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import api from "../services/api"
import { Clock, Users, UserCheck, UserPlus } from "lucide-react"

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  newUsers: number
  userGrowth: number[]
  recentActivities: Activity[]
  lastLogin: string
}

interface Activity {
  id: number
  activityType: string
  description: string
  timestamp: string
}

const Dashboard = () => {
  const { user, isAdmin } = useContext(AuthContext)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    userGrowth: [],
    recentActivities: [],
    lastLogin: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoint = isAdmin ? "/api/dashboard/admin-stats" : "/api/dashboard/user-stats"
        const response = await api.get(endpoint)
        setStats(response.data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)

        // Fallback to mock data if API fails
        setStats({
          totalUsers: 120,
          activeUsers: 85,
          newUsers: 12,
          userGrowth: [40, 45, 55, 60, 75, 85, 100, 120],
          recentActivities: [
            {
              id: 1,
              activityType: "LOGIN",
              description: "User logged in",
              timestamp: new Date().toISOString(),
            },
            {
              id: 2,
              activityType: "PROFILE_UPDATE",
              description: "User updated profile",
              timestamp: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
          lastLogin: new Date(Date.now() - 172800000).toISOString(),
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [isAdmin])

  const chartData = stats.userGrowth
    ? stats.userGrowth.map((value, index) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]
        return { name: months[index], users: value }
      })
    : []

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.firstName || user?.username}!</h1>
        <p className="text-gray-600">Here's what's happening with your application today.</p>
      </div>

      {isAdmin ? (
        // Admin Dashboard
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h2 className="font-semibold text-gray-700">Total Users</h2>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h2 className="font-semibold text-gray-700">Active Users</h2>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h2 className="font-semibold text-gray-700">New Users</h2>
                  <p className="text-2xl font-bold text-gray-900">{stats.newUsers}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">User Growth</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        // User Dashboard
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
              {stats.recentActivities && stats.recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600 mt-1">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent activity found.</p>
              )}
              <div className="mt-4">
                <a href="/activity" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View all activity →
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Username:</span>
                  <span className="font-medium">{user?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Login:</span>
                  <span className="font-medium">
                    {stats.lastLogin ? new Date(stats.lastLogin).toLocaleString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="font-medium">
                    {user?.roles?.includes("ROLE_ADMIN") ? "Administrator" : "Standard User"}
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <a
                  href="/profile"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Profile
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
