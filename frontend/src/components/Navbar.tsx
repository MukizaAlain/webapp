"use client"

import { useContext } from "react"
import { Link } from "react-router-dom"
import AuthContext from "../context/AuthContext"
import { Menu, Bell, User } from "lucide-react"

interface NavbarProps {
  onMenuButtonClick: () => void
}

const Navbar = ({ onMenuButtonClick }: NavbarProps) => {
  const { user, logout } = useContext(AuthContext)

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuButtonClick}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="ml-2 md:ml-0 text-xl font-semibold text-gray-800">Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
            <Bell className="h-6 w-6" />
          </button>

          <div className="relative">
            <div className="flex items-center space-x-2">
              <span className="hidden md:block text-sm font-medium text-gray-700">{user?.username}</span>
              <Link to="/profile" className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
                  <User className="h-5 w-5" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
