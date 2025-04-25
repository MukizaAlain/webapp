"use client"

import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useContext } from "react"
import AuthContext from "../context/AuthContext"

interface AdminRouteProps {
  children: ReactNode
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext)

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" />
  }

  return <>{children}</>
}

export default AdminRoute
