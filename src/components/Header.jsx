import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/react.svg";
import Login from "./Login";

export default function Header({ cartCount = 0 }) {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const navStyle = ({ isActive }) =>
    isActive
      ? "text-green-600 font-semibold"
      : "text-gray-700 hover:text-green-600 transition";

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">

        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3"
            >
              <img
                src={logo}
                alt="Logo"
                className="h-12 w-12"
              />

              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Green Market
                </h1>

                <p className="text-xs text-gray-500">
                  Fresh & Organic Products
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">

              <NavLink to="/" className={navStyle}>
                Home
              </NavLink>

              <NavLink to="/products" className={navStyle}>
                Products
              </NavLink>

              <NavLink to="/gallery" className={navStyle}>
                Gallery
              </NavLink>

              <NavLink to="/about" className={navStyle}>
                About
              </NavLink>

              <NavLink to="/contact" className={navStyle}>
                Contact
              </NavLink>

            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">

              {/* Search */}
              <div className="hidden lg:flex">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="border rounded-full px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative"
              >
                <span className="text-3xl">
                  🛒
                </span>

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
              {!user ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="hidden md:block bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition"
                >
                  Login
                </button>
              ) : (
                <div className="relative hidden md:block">

                  <button
                    onClick={() =>
                      setDropdownOpen(!dropdownOpen)
                    }
                    className="flex items-center gap-2"
                  >
                    <div className="w-11 h-11 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                      {user.fullname?.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-xl border overflow-hidden">

                      <div className="p-4 border-b">
                        <h3 className="font-semibold">
                          {user.fullname}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {user.email}
                        </p>
                      </div>

                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gray-100"
                      >
                        My Profile
                      </button>

                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gray-100"
                      >
                        Orders
                      </button>

                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gray-100"
                      >
                        Settings
                      </button>

                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>

                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-3xl"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                ☰
              </button>

            </div>

          </div>

        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">

            <div className="flex flex-col p-5 gap-4">

              <Link to="/" onClick={() => setMenuOpen(false)}>
                Home
              </Link>

              <Link to="/products" onClick={() => setMenuOpen(false)}>
                Products
              </Link>

              <Link to="/gallery" onClick={() => setMenuOpen(false)}>
                Gallery
              </Link>

              <Link to="/about" onClick={() => setMenuOpen(false)}>
                About
              </Link>

              <Link to="/contact" onClick={() => setMenuOpen(false)}>
                Contact
              </Link>

              <Link to="/cart" onClick={() => setMenuOpen(false)}>
                Cart ({cartCount})
              </Link>

              {!user ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-green-600 text-white py-2 rounded-lg"
                >
                  Login
                </button>
              ) : (
                <>
                  <div className="font-semibold">
                    {user.fullname}
                  </div>

                  <button
                    onClick={logout}
                    className="text-red-600"
                  >
                    Logout
                  </button>
                </>
              )}

            </div>

          </div>
        )}
      </header>

      {showForm && (
        <Login closeForm={() => setShowForm(false)} />
      )}
    </>
  );
}