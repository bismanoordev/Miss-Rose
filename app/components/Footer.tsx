"use client";

import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaPinterestP,
  FaSnapchatGhost,
  FaStar,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#F9FAFB] border-t border-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 md:space-y-0 md:grid md:grid-cols-4 md:gap-10">

        {/* Brand & Contact */}
        <div className="space-y-4 text-sm text-black">
          <div>
            <h2 className="text-2xl font-serif font-semibold tracking-wide">
              MISS RÔSE
            </h2>
            <p className="text-xs tracking-widest">MISSROSE.COM.PK</p>
          </div>

          <p>
            Reach us at:
            <br />
            <span className="font-medium underline text-blue-500">
              missrose.com.pk@gmail.com
            </span>
          </p>

          <p>
            For Queries Call/Whatsapp at:
            <br />
            <span className="font-medium underline text-blue-500">
              0333-0529002
            </span>
            <br />
            <span className="text-xs">(Mon–Sat 9am–5pm)</span>
          </p>

          <p>
            Automated Customer Chat:
            <br />
            <span className="font-medium underline text-blue-500">
              +923100003721
            </span>
            <br />
            <span className="text-xs">(Whatsapp only)</span>
          </p>
        </div>

        {/* Quick Links */}
        <div className="text-sm text-black">
          <h3 className="font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link href="/">Shop</Link></li>
            <li><Link href="/">New Arrival</Link></li>
            <li><Link href="/">Customer Reviews</Link></li>
            <li><Link href="/">Track Your Order</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li>
              <Link href="/Contact-us" className="underline text-blue-500">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Policies */}
        <div className="text-sm text-black">
          <h3 className="font-semibold mb-4">Policies</h3>
          <ul className="space-y-2">
            <li><Link href="/">Blogs</Link></li>
            <li><Link href="/">Wholesale Account</Link></li>
            <li><Link href="/">Blogger Account</Link></li>
            <li><Link href="/">Shipping Policy</Link></li>
            <li><Link href="/">Privacy Policy</Link></li>
            <li><Link href="/">Refund Policy</Link></li>
            <li><Link href="/">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Reviews & Badges */}
        <div className="text-center md:text-left">
          <h3 className="font-semibold mb-4">Customer Reviews</h3>

          {/* Stars */}
          <div className="flex justify-center md:justify-start items-center gap-2 text-green-600 mb-4">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} />
            ))}
            <span className="ml-2 text-sm font-medium">14821 reviews</span>
          </div>

          {/* Badges */}
          <div className="flex justify-center md:justify-start gap-4 overflow-x-auto py-2">
            <img src="/badges/brand-trust.png" alt="Brand Trust" className="h-16 md:h-20" />
            <img src="/badges/top-1.png" alt="Top 1% Trending" className="h-16 md:h-20" />
            <img src="/badges/verified-14k.png" alt="14.8k Verified Reviews" className="h-16 md:h-20" />
          </div>
        </div>
      </div>

      {/* Social Icons */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto flex justify-center md:justify-start bg-[#F9FAFB] gap-6 text-lg text-black">
          <FaFacebookF />
          <FaInstagram />
          <FaYoutube />
          <FaTiktok />
          <FaPinterestP />
          <FaSnapchatGhost />
        </div>
      </div>
    </footer>
  );
}
