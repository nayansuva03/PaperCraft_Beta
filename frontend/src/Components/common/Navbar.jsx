import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../../Redux/themeSlice";
import { useState } from "react";
import { Menu, X, Sun, Moon, User, LogOut } from "lucide-react";
import {
  setname,
  setemail,
  setisLoggedIn,
} from "../../Redux/userSlice.js";
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const theme = useSelector((state) => state.theme.theme);
  const name = useSelector((state) => state.user.name);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

  // Helper function for navlink active state styling (with dark mode support)
  const getLinkClass = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${isActive
      ? "text-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold"
      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
    }`;

  const handleOnLogin = () => navigate("/LogIn");
  const handleOnSignin = () => navigate("/signIn");
  const handleOnLogout = async () => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    dispatch(setname(""));
    dispatch(setemail(""));
    dispatch(setisLoggedIn(false));
  }
  const handleToggleTheme = () => {
    dispatch(setTheme(theme === "dark" ? "light" : "dark"));
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Navbar Bar */}
        <div className="flex justify-between h-16 items-center">

          {/* Brand Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight hover:opacity-90 transition-opacity"
          >
            <span className="font-extrabold text-slate-800 dark:text-white text-xl tracking-tight">
              Paper<span className="text-indigo-600 dark:text-indigo-400">Craft</span>
            </span>
          </NavLink>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" className={getLinkClass}>
              Home
            </NavLink>
            <NavLink to="/SavedServices" className={getLinkClass}>
              Saved Services
            </NavLink>
            <NavLink to="/About" className={getLinkClass}>
              About Us
            </NavLink>
          </div>

          {/* Desktop Right Side Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Dark Mode Icon Toggle */}
            <button
              onClick={handleToggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 my-auto" />

            {!isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleOnLogin}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
                >
                  Log In
                </button>
                <button
                  onClick={handleOnSignin}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 rounded-xl shadow-sm transition-all duration-200"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* User Profile Pill */}
                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                    {name ? name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                    {name}
                  </span>
                </div>

                <button
                  onClick={handleOnLogout}
                  aria-label="Log out"
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors duration-200"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={handleToggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-1">
              <NavLink
                to="/"
                onClick={() => setMenuOpen(false)}
                className={getLinkClass}
              >
                Home
              </NavLink>

              <NavLink
                to="/SavedServices"
                onClick={() => setMenuOpen(false)}
                className={getLinkClass}
              >
                Saved Services
              </NavLink>

              <NavLink
                to="/About"
                onClick={() => setMenuOpen(false)}
                className={getLinkClass}
              >
                About Us
              </NavLink>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                {!isLoggedIn ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        handleOnLogin();
                        setMenuOpen(false);
                      }}
                      className="w-full py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        handleOnSignin();
                        setMenuOpen(false);
                      }}
                      className="w-full py-2.5 rounded-xl font-semibold text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-2 py-1">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold">
                        {name ? name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {name}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        handleOnLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </nav>
  );
}

export default Navbar;