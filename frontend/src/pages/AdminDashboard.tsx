"use client"

import type React from "react"

import { useState, useEffect, useContext } from "react"
import api from "../services/api"
import AuthContext from "../context/AuthContext"
import { Edit, Trash2, Search, UserPlus, Users, UserCheck, Shield, AlertTriangle } from "lucide-react"

interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  roles: { name: string }[]
  enabled: boolean
  emailVerified: boolean
}

interface AdminStats {
  totalUsers: number
  activeUsers: number
  verifiedUsers: number
  usersByRole: {
    admin: number
    moderator: number
    user: number
  }
}

const AdminDashboard = () => {
  const { user: currentUser } = useContext(AuthContext)
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    roles: [] as string[],
    enabled: true,
    emailVerified: true,
  })
  const [createForm, setCreateForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: ["ROLE_USER"] as string[],
  })
  const [activeTab, setActiveTab] = useState("users")

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get("/api/admin/users")
      setUsers(response.data)
    } catch (err: any) {
      setError("Failed to fetch users")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get("/api/admin/stats")
      setStats(response.data)
    } catch (err: any) {
      console.error("Failed to fetch stats:", err)
    }
  }

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
    )
  })

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const handleEditClick = (user: User) => {
    setUserToEdit(user)
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email,
      roles: user.roles.map((role) => role.name),
      enabled: user.enabled,
      emailVerified: user.emailVerified,
    })
    setShowEditModal(true)
  }

  const handleCreateClick = () => {
    setCreateForm({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      roles: ["ROLE_USER"],
    })
    setShowCreateModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      await api.delete(`/api/admin/users/${userToDelete.id}`)
      setUsers(users.filter((user) => user.id !== userToDelete.id))
      setShowDeleteModal(false)
      setUserToDelete(null)
      fetchStats() // Refresh stats after deletion
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user")
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userToEdit) return

    try {
      const response = await api.put(`/api/admin/users/${userToEdit.id}`, editForm)
      setUsers(users.map((user) => (user.id === userToEdit.id ? response.data : user)))
      setShowEditModal(false)
      setUserToEdit(null)
      fetchStats() // Refresh stats after update
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user")
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (createForm.password !== createForm.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      const userData = {
        username: createForm.username,
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        password: createForm.password,
        roles: createForm.roles,
      }

      const response = await api.post("/api/admin/users", userData)
      setUsers([...users, response.data])
      setShowCreateModal(false)
      setError("")
      fetchStats() // Refresh stats after creation
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create user")
    }
  }

  if (loading && users.length === 0) {
    return <div className="flex justify-center items-center h-full">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError("")}>
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`${
              activeTab === "users"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`${
              activeTab === "stats"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Statistics
          </button>
        </nav>
      </div>

      {activeTab === "users" ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Username
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Roles
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.enabled ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                        {!user.emailVerified && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Unverified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.roles.map((role) => role.name).join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        disabled={currentUser?.id === user.id}
                        title="Edit user"
                        aria-label="Edit user"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600 hover:text-red-900"
                        disabled={currentUser?.id === user.id}
                        title="Delete user"
                        aria-label="Delete user"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                      <Shield className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h2 className="font-semibold text-gray-700">Verified Users</h2>
                      <p className="text-2xl font-bold text-gray-900">{stats.verifiedUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h2 className="font-semibold text-gray-700">Unverified Users</h2>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers - stats.verifiedUsers}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Users by Role</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700">Administrators</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.usersByRole.admin}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700">Moderators</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.usersByRole.moderator}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700">Regular Users</h3>
                    <p className="text-3xl font-bold text-purple-600">{stats.usersByRole.user}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-40">Loading statistics...</div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete User</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete {userToDelete?.firstName} {userToDelete?.lastName}? This action
                        cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setUserToDelete(null)
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Edit User</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Roles</label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          id="role-user"
                          name="role-user"
                          type="checkbox"
                          checked={editForm.roles.includes("ROLE_USER")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditForm({ ...editForm, roles: [...editForm.roles, "ROLE_USER"] })
                            } else {
                              setEditForm({
                                ...editForm,
                                roles: editForm.roles.filter((role) => role !== "ROLE_USER"),
                              })
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="role-user" className="ml-2 block text-sm text-gray-900">
                          User
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="role-admin"
                          name="role-admin"
                          type="checkbox"
                          checked={editForm.roles.includes("ROLE_ADMIN")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditForm({ ...editForm, roles: [...editForm.roles, "ROLE_ADMIN"] })
                            } else {
                              setEditForm({
                                ...editForm,
                                roles: editForm.roles.filter((role) => role !== "ROLE_ADMIN"),
                              })
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="role-admin" className="ml-2 block text-sm text-gray-900">
                          Admin
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="role-moderator"
                          name="role-moderator"
                          type="checkbox"
                          checked={editForm.roles.includes("ROLE_MODERATOR")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditForm({ ...editForm, roles: [...editForm.roles, "ROLE_MODERATOR"] })
                            } else {
                              setEditForm({
                                ...editForm,
                                roles: editForm.roles.filter((role) => role !== "ROLE_MODERATOR"),
                              })
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="role-moderator" className="ml-2 block text-sm text-gray-900">
                          Moderator
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Status</label>
                      <div className="mt-2">
                        <div className="flex items-center">
                          <input
                            id="enabled"
                            name="enabled"
                            type="checkbox"
                            checked={editForm.enabled}
                            onChange={(e) => setEditForm({ ...editForm, enabled: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">
                            Enabled
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email Verification</label>
                      <div className="mt-2">
                        <div className="flex items-center">
                          <input
                            id="emailVerified"
                            name="emailVerified"
                            type="checkbox"
                            checked={editForm.emailVerified}
                            onChange={(e) => setEditForm({ ...editForm, emailVerified: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="emailVerified" className="ml-2 block text-sm text-gray-900">
                            Email Verified
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowEditModal(false)
                      setUserToEdit(null)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Create New User</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username*
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        required
                        value={createForm.username}
                        onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="createFirstName" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="createFirstName"
                          name="firstName"
                          value={createForm.firstName}
                          onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="createLastName" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="createLastName"
                          name="lastName"
                          value={createForm.lastName}
                          onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="createEmail" className="block text-sm font-medium text-gray-700">
                        Email*
                      </label>
                      <input
                        type="email"
                        id="createEmail"
                        name="email"
                        required
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="createPassword" className="block text-sm font-medium text-gray-700">
                          Password*
                        </label>
                        <input
                          type="password"
                          id="createPassword"
                          name="password"
                          required
                          value={createForm.password}
                          onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm Password*
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          required
                          value={createForm.confirmPassword}
                          onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Roles</label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center">
                          <input
                            id="create-role-user"
                            name="create-role-user"
                            type="checkbox"
                            checked={createForm.roles.includes("ROLE_USER")}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCreateForm({ ...createForm, roles: [...createForm.roles, "ROLE_USER"] })
                              } else {
                                setCreateForm({
                                  ...createForm,
                                  roles: createForm.roles.filter((role) => role !== "ROLE_USER"),
                                })
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="create-role-user" className="ml-2 block text-sm text-gray-900">
                            User
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="create-role-admin"
                            name="create-role-admin"
                            type="checkbox"
                            checked={createForm.roles.includes("ROLE_ADMIN")}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCreateForm({ ...createForm, roles: [...createForm.roles, "ROLE_ADMIN"] })
                              } else {
                                setCreateForm({
                                  ...createForm,
                                  roles: createForm.roles.filter((role) => role !== "ROLE_ADMIN"),
                                })
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="create-role-admin" className="ml-2 block text-sm text-gray-900">
                            Admin
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="create-role-moderator"
                            name="create-role-moderator"
                            type="checkbox"
                            checked={createForm.roles.includes("ROLE_MODERATOR")}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCreateForm({ ...createForm, roles: [...createForm.roles, "ROLE_MODERATOR"] })
                              } else {
                                setCreateForm({
                                  ...createForm,
                                  roles: createForm.roles.filter((role) => role !== "ROLE_MODERATOR"),
                                })
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="create-role-moderator" className="ml-2 block text-sm text-gray-900">
                            Moderator
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowCreateModal(false)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
