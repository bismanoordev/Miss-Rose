"use client";

import { Toaster } from "react-hot-toast";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "aos/dist/aos.css";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./lib/firebase";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{ email: string; role: string } | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user profile from Firestore when user changes
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as { email: string; role: string });
        } else {
          setUserProfile(null);
        }
      };
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  console.log("bisma userProfile", userProfile);

  // Check if current route starts with Dashboard (for all dashboard routes)
  const isAdmin = userProfile?.role === "admin";

  console.log("bisma isAdmin", isAdmin);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Conditionally render Navbar - hide for admin and all dashboard pages */}
        {!isAdmin && <Navbar />}

        {children}

        <Toaster position="top-right" reverseOrder={false} />

        {/* Conditionally render Footer - hide for admin and all dashboard pages */}
        {!isAdmin && <Footer />}
      </body>
    </html>
  );
}