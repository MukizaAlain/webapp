"use client"

import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useContext } from "react"
import AuthContext from "../context/AuthContext"

interface PrivateRouteProps {
  children: ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, loading } = useContext(AuthContext)

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}

export default PrivateRoute
