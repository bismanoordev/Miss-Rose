"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 

import "aos/dist/aos.css";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

import toast from "react-hot-toast";

export default function ReviewForm() {
  const router = useRouter(); 
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  

  const handleSubmit = async () => {
    if (!db) {
      toast.error("Service unavailable. Please refresh the page.");
      return;
    }

    if (!rating || !review || !name) {
      toast.error("Please fill required fields");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Submitting review...");

    try {
      await addDoc(collection(db, "reviews"), {
        rating,
        review,
        name,
        email,
        createdAt: serverTimestamp(),
      });

      toast.success("Review submitted successfully", {
        id: toastId,
      });

      // Reset form
      setRating(0);
      setHover(0);
      setReview("");
      setName("");
      setEmail("");

     
      setTimeout(() => {
        router.push("/");
      }, 1500); 

    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Something went wrong", {
        id: toastId,
      });
    }

    setLoading(false);
  };

  return (
    <div className="bg-[#F9FAFB]">
      <div
        className="max-w-2xl mx-auto bg-[#F9FAFB] py-25 px-8 "
      >
        <h1 className="text-center font-serif text-3xl font-bold mb-3.5">
          Customer Review
        </h1>

        {/* Rating */}
        <div className="mb-6 text-center">
          <label className="block text-sm font-medium mb-2">
            Your Rating
          </label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="text-3xl"
              >
                <span
                  className={
                    star <= (hover || rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Review */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Your Review
          </label>
          <textarea
            rows={4}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Your Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional. Will not be displayed publicly.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full px-6 py-2 rounded bg-black hover:bg-gray-800 text-white transition disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
