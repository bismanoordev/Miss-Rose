"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";
import { FiUser, FiLogOut, FiMenu, FiX, FiHome, FiTag, FiStar, FiInfo, FiChevronRight, FiPlus, FiShoppingBag } from "react-icons/fi";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }

      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('button[aria-label="menu"]')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) return null;

  const handleLogout = async () => {
    if (!auth) return;
    await auth.signOut();
    setProfileDropdownOpen(false);
    setMenuOpen(false);
    router.push("/");
  };

  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleProfileNavigation = () => {
    router.push("/Profile");
    setProfileDropdownOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-lg sm:text-xl font-serif font-semibold tracking-wide text-gray-900">
            MISS RÔSE
          </span>
          <span className="text-[10px] sm:text-xs tracking-widest text-gray-500">
            MISSROSE.COM.PK
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 lg:gap-8 text-sm font-medium tracking-wide">
          <Link
            href="/"
            className="text-gray-700 hover:text-[#C67F90] transition-colors duration-200"
          >
            HOME
          </Link>

          {user && (
            <>
              <Link
                href="/Sale"
                className="text-gray-700 hover:text-[#C67F90] transition-colors duration-200"
              >
                SALE
              </Link>
              <Link
                href="/Reviews"
                className="text-gray-700 hover:text-[#C67F90] transition-colors duration-200"
              >
                REVIEWS
              </Link>
              <Link
                href="/About-us"
                className="text-gray-700 hover:text-[#C67F90] transition-colors duration-200"
              >
                ABOUT US
              </Link>

              {/* New Product Link - Only for logged-in users */}
              <Link
                href="/New-Products"
                className="flex items-center gap-1 text-gray-700 hover:text-[#C67F90] transition-colors duration-200"
              >
                <FiPlus size={14} />
                NEW PRODUCT
              </Link>

              {/* Shop Link - For all users */}
              <Link
                href="/Shop"
                className="flex items-center gap-1 text-gray-700 hover:text-[#C67F90] transition-colors duration-200"
              >
                <FiShoppingBag size={14} />
                SHOP
              </Link>
            </>
          )}
        </nav>

        {/* Desktop Auth/Profile Section */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link
                href="/Login"
                className="text-sm font-medium px-4 py-2 rounded-full bg-[#C67F90] text-white hover:bg-pink-600 transition-colors duration-200"
              >
                Login
              </Link>

              <Link
                href="/Sign-up"
                className="text-sm font-medium px-4 py-2 rounded-full bg-[#C67F90] text-white hover:bg-pink-600 transition-colors duration-200"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="relative" ref={profileRef}>
              {/* Profile Picture/Button */}
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full p-1"
                aria-label="Profile menu"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#C67F90] transition-colors duration-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-300 flex items-center justify-center">
                      <FiUser className="text-gray-600 text-base" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden lg:block">
                  {user.displayName?.split(' ')[0] || "Profile"}
                </span>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleProfileNavigation}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 group"
                    >
                      <div className="flex items-center gap-3">
                        <FiUser className="text-gray-400 group-hover:text-[#C67F90]" />
                        <span>My Profile</span>
                      </div>
                      <FiChevronRight className="text-gray-300 group-hover:text-[#C67F90]" />
                    </button>


                  </div>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 group"
                  >
                    <div className="flex items-center gap-3">
                      <FiLogOut className="text-red-500" />
                      <span>Logout</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-[#C67F90] transition-colors duration-200"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`
    fixed inset-0 bg-black/50 z-40 md:hidden
    transition-opacity duration-300
    ${menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
  `}
            onClick={() => setMenuOpen(false)}
          />


          {/* Menu Panel */}
          <div
            ref={menuRef}
            className={`
    fixed top-0 right-0 h-full
    w-[85%] max-w-sm
    bg-white shadow-2xl z-50 md:hidden
    transform transition-transform duration-300 ease-in-out
    ${menuOpen ? "translate-x-0" : "translate-x-full"}
  `}
          >

            <div className="h-full flex flex-col">
              {/* Menu Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-lg font-serif font-semibold tracking-wide">
                      MISS RÔSE
                    </span>
                    <span className="text-xs tracking-widest text-gray-500">
                      MISSROSE.COM.PK
                    </span>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    aria-label="Close menu"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
              </div>

              {/* User Info Section */}
              {user && (
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                          <FiUser className="text-white text-xl" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      <button
                        onClick={handleProfileNavigation}
                        className="mt-2 text-xs font-medium text-[#C67F90] hover:text-pink-700"
                      >
                        View Profile →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-4">
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-150 group"
                  >
                    <FiHome className="text-gray-400 group-hover:text-[#C67F90]" />
                    <span className="font-medium">HOME</span>
                  </Link>

                  {user && (
                    <>
                      <Link
                        href="/Sale"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-150 group"
                      >
                        <FiTag className="text-gray-400 group-hover:text-[#C67F90]" />
                        <span className="font-medium">SALE</span>
                      </Link>

                      <Link
                        href="/Reviews"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-150 group"
                      >
                        <FiStar className="text-gray-400 group-hover:text-[#C67F90]" />
                        <span className="font-medium">REVIEWS</span>
                      </Link>

                      <Link
                        href="/About-us"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-150 group"
                      >
                        <FiInfo className="text-gray-400 group-hover:text-[#C67F90]" />
                        <span className="font-medium">ABOUT US</span>
                      </Link>

                      {/* New Product Link in Mobile Menu */}
                      <Link
                        href="/New-Products"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-150 group"
                      >
                        <FiPlus className="text-gray-400 group-hover:text-[#C67F90]" />
                        <span className="font-medium">NEW PRODUCT</span>
                      </Link>

                      {/* Shop Link in Mobile Menu */}
                      <Link
                        href="/Shop"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-150 group"
                      >
                        <FiShoppingBag className="text-gray-400 group-hover:text-[#C67F90]" />
                        <span className="font-medium">SHOP</span>
                      </Link>
                    </>
                  )}
                </nav>

                {/* Account Section for Logged-in Users */}
                {user && (
                  <div className="mt-6 px-4">
                    <div className="px-4 mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Account
                      </p>
                    </div>
                    <nav className="space-y-1">
                      <button
                        onClick={handleProfileNavigation}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-150 group text-left"
                      >
                        <FiUser className="text-gray-400 group-hover:text-[#C67F90]" />
                        <span className="font-medium">My Profile</span>
                      </button>

                    
                    </nav>
                  </div>
                )}
              </div>

              {/* Auth Buttons */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                {!user ? (
                  <div className="space-y-3">
                    <Link
                      href="/Login"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-center py-3 px-4 bg-linear-to-r from-[#C67F90] to-pink-500 text-white font-medium rounded-full hover:opacity-90 transition-opacity duration-200 shadow-sm"
                    >
                      Login
                    </Link>

                    <Link
                      href="/Sign-up"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-center py-3 px-4 bg-white text-gray-900 border border-gray-300 font-medium rounded-full hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                    >
                      Sign Up
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-linear-to-r from-red-500 to-red-600 text-white font-medium rounded-full hover:opacity-90 transition-opacity duration-200 shadow-sm"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}


      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}