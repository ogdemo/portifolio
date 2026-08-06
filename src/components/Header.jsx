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
      ? "text-emerald-700 font-semibold relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:rounded-full after:bg-emerald-600"
      : "text-slate-600 hover:text-emerald-700 transition-colors duration-200";

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl 
      border-b border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between h-20 gap-4">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 min-w-0"
            >
              <div className="flex h-11 w-11 items-center justify-center 
              rounded-2xl bg-emerald-600/10 ring-1 ring-emerald-200">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-8 w-8"
                />
              </div>

              <div className="min-w-0">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  Mr-Protfolio
                </h1>

                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                  Fresh & Organic Products
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7 rounded-full border
             border-slate-200 bg-white/80 px-5 py-3 shadow-sm">

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
            <div className="flex items-center gap-3 sm:gap-4">

              {/* Search */}
              <div className="hidden lg:flex items-center rounded-full border border-slate-200
               bg-slate-50 px-4 py-2 shadow-sm">
                <span className="mr-2 text-slate-400">⌕</span>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-64 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
                aria-label="Shopping cart"
              >
                <span>🛒</span>

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
              {!user ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="hidden md:inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Login
                </button>
              ) : (
                <div className="relative hidden md:block">

                  <button
                    onClick={() =>
                      setDropdownOpen(!dropdownOpen)
                    }
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-emerald-300"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                      {user.fullname?.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                      <div className="border-b border-slate-100 p-4">
                        <h3 className="font-semibold text-slate-900">
                          {user.fullname}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {user.email}
                        </p>
                      </div>

                      <button
                        className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        My Profile
                      </button>

                      <button
                        className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        Orders
                      </button>

                      <button
                        className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        Settings
                      </button>

                      <button
                        onClick={logout}
                        className="w-full px-4 py-3 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                      >
                        Logout
                      </button>

                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl text-slate-700 shadow-sm md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation menu"
              >
                ☰
              </button>

            </div>

          </div>

        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white/95 md:hidden shadow-lg backdrop-blur-xl">

            <div className="mx-auto flex max-w-7xl flex-col gap-2 p-4">

              <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Home
              </Link>

              <Link to="/products" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Products
              </Link>

              <Link to="/gallery" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Gallery
              </Link>

              <Link to="/about" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                About
              </Link>

              <Link to="/contact" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Contact
              </Link>

              <Link to="/cart" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cart ({cartCount})
              </Link>

              {!user ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Login
                </button>
              ) : (
                <>
                  <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800">
                    {user.fullname}
                  </div>

                  <button
                    onClick={logout}
                    className="rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
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