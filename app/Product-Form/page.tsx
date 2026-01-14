"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductForm() {
  const [quantity, setQuantity] = useState(1);
  const [shade, setShade] = useState("Fair");
  const router = useRouter();

  const handleBuyNow = () => {
    router.push(
      `/Checkout?shade=${shade}&quantity=${quantity}`
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center pb-8 bg-[#F9FAFB]">
      <div className="max-w-md w-full p-4 space-y-5">

        {/* Title */}
        <h1 className="text-2xl font-semibold text-black text-center">
          UPTO 70% OFF
          <br />
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Sale
          </span>
        </h1>

        {/* Shade */}
        <div>
          <label className="block text-sm font-medium mb-1">Shade</label>
          <select
            value={shade}
            onChange={(e) => setShade(e.target.value)}
            className="w-full border border-gray-400 px-3 py-2 outline-none cursor-pointer"
          >
            <option>Fair</option>
            <option>Ivory</option>
            <option>Natural</option>
            <option>Warm</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <div className="flex items-center w-32 border border-gray-400">
            <button
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
              className="w-10 h-10 text-xl cursor-pointer"
            >
              −
            </button>
            <span className="flex-1 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 text-xl cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleBuyNow}
          className="w-full bg-black text-white py-3 font-medium hover:bg-gray-800 cursor-pointer rounded-lg"
        >
          Buy it now
        </button>

        <button onClick={() => router.push("/Shop")} className="w-full border bg-black py-3 font-medium text-white rounded-lg hover:bg-gray-800 hover:text-white cursor-pointer">
           Cancel
        </button>

      </div>
    </div>
  );
}
