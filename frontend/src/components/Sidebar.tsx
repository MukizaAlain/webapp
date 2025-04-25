"use client"

import { useContext } from "react"
import { Link, useLocation } from "react-router-dom"
import AuthContext from "../context/AuthContext"
import { Home, Users, User, Settings, Activity, LogOut } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { logout, isAdmin, user } = useContext(AuthContext)
  const location = useLocation()

  const handleLogout = () => {
    logout()
  }

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Activity", path: "/activity", icon: Activity },
    { name: "Settings", path: "/settings", icon: Settings },
  ]

  if (isAdmin) {
    navItems.push({ name: "Admin", path: "/admin", icon: Users })
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b">
            <h2 className="text-xl font-bold text-gray-800">Web App</h2>
          </div>

          {user && (
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <span className="font-medium text-sm">{user.firstName?.charAt(0) || user.username.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2 text-sm rounded-md ${
                      location.pathname === item.path ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
