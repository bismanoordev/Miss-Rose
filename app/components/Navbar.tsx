"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation"; // import router

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter(); // initialize router

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/"); // redirect to home
  };

  return (
    <header className="w-full bg-gray-50 border-b border-gray-400">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <div className="flex flex-col leading-none">
          <span className="text-xl font-serif font-semibold tracking-wide">
            MISS RÔSE
          </span>
          <span className="text-xs tracking-widest text-gray-500">
            MISSROSE.COM.PK
          </span>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
          <Link href="/" className="hover:text-[#C67F90]">HOME</Link>

          {user && (
            <>
              <Link href="/Sale" className="hover:text-[#C67F90]">SALE</Link>
              <Link href="/Reviews" className="hover:text-[#C67F90]">CUSTOMER REVIEWS</Link>
              <Link href="/About-us" className="hover:text-[#C67F90]">ABOUT US</Link>
            </>
          )}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link
                href="/Login"
                className="text-sm font-medium px-4 py-2 border bg-black text-white rounded-full hover:bg-gray-700 transition"
              >
                Login
              </Link>

              <Link
                href="/Sign-up"
                className="text-sm font-medium px-4 py-2 rounded-full bg-black text-white hover:bg-gray-700 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout} // use the new logout handler
              className="text-sm font-medium px-4 py-2 rounded-full bg-black text-white hover:bg-gray-700 transition"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#f9fafbb6] border-t shadow-lg">
          <div className="px-6 py-6 space-y-5">

            {/* Navigation Links */}
            <nav className="flex flex-col gap-4 text-sm font-medium tracking-wide">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="hover:text-[#C67F90] transition"
              >
                HOME
              </Link>

              {user && (
                <>
                  <Link
                    href="/Sale"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-[#C67F90] transition"
                  >
                    SALE
                  </Link>

                  <Link
                    href="/Reviews"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-[#C67F90] transition"
                  >
                    CUSTOMER REVIEWS
                  </Link>

                  <Link
                    href="/About-us"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-[#C67F90] transition"
                  >
                    ABOUT US
                  </Link>
                </>
              )}
            </nav>

            {/* Divider */}
            <div className="h-px bg-gray-200" />

            {/* Auth Buttons */}
            <div className="flex flex-col gap-3">
              {!user ? (
                <>
                  <Link
                    href="/Login"
                    onClick={() => setMenuOpen(false)}
                    className="text-center py-3 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition"
                  >
                    Login
                  </Link>

                  <Link
                    href="/Sign-up"
                    onClick={() => setMenuOpen(false)}
                    className="text-center py-3 rounded-full border border-black text-sm font-medium hover:bg-black hover:text-white transition"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="py-3 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
