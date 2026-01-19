"use client";

import { motion } from "framer-motion";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#C67F90] flex font-serif flex-col items-center justify-center px-4">

      {/* Heading Animation */}
      <motion.h1
        className="text-[#f5f0f2] text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center font-bold font-serif mb-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        Miss Rose
      </motion.h1>

      {/* Paragraph Animation */}
      <motion.p
        className="text-[#faf9f9] text-base sm:text-lg md:text-xl lg:text-2xl text-center leading-relaxed font-serif max-w-3xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      >
        Official Miss Rose Website
        <br />
        <span className="text-[#b9405e] font-bold"> Missrose.com.pk</span>
        <br />
        100% Authentic Miss Rose Cosmetics in Pakistan
      </motion.p>

    </div>
  );
}
