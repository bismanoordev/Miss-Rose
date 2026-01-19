"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../lib/firebase";

const products = [
  { id: "1", img: "card1.png", title: "Miss Rose Silk Flawless Foundation" },
  { id: "2", img: "card2.png", title: "Miss Rose Full Coverage Concealer" },
  { id: "3", img: "card3.png", title: "Miss Rose Perfect Cover 24H Hydrating Concealer" },
  { id: "4", img: "card4.png", title: "Miss Rose Full Coverage Matte Foundation" },
  { id: "5", img: "card5.png", title: "Miss Rose Silk Radiance BB Cream" },
  { id: "6", img: "card6.png", title: "Miss Rose Glossy Gloss Lip Comfort" },
  { id: "7", img: "card7.png", title: "Miss Rose Cat Eye Mascara Permanent" },
  { id: "8", img: "card8.png", title: "Miss Rose Two Way Compact Powder" },
  { id: "9", img: "card3.png", title: "Miss Rose Perfect Cover 24H Hydrating Concealer" },
  { id: "10", img: "card4.png", title: "Miss Rose Full Coverage Matte Foundation" },
  { id: "11", img: "card5.png", title: "Miss Rose Silk Radiance BB Cream" },
  { id: "12", img: "card6.png", title: "Miss Rose Glossy Gloss Lip Comfort" },
];

const Card = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
  if (!auth) {
    setUser(null);
    return;
  }

  const unsub = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });

  return () => unsub();
}, []);


  const handleBuyNow = (productId: string) => {
    if (!user) {
      router.push("/Login");
    } else {
      // Change this line only - navigate to ProductForm instead of Product detail
      router.push(`/ProductForm?productId=${productId}`);
    }
  };


  return (
    <div>
      <h1
        className="text-black mt-9 text-5xl text-center leading-relaxed font-serif"
      >
        SHOP ALL
      </h1>

      <div className="p-9 pb-20 flex gap-5 font-serif flex-wrap justify-center">
        {products.map((item, index) => (
          <div
            key={index}
            className="bg-neutral-primary-soft block max-w-2xs border border-gray-300 rounded-2xl shadow-xs transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]"
          >
            <img
              className="h-52 w-full rounded-t-2xl"
              src={`/${item.img}`}
              alt={item.title}
            />

            <div className="p-3 text-center text-black rounded-b-2xl">
              <h5 className="mt-3 mb-3  text-lg font-semibold">
                {item.title}
              </h5>

              <button
                onClick={() => handleBuyNow(item.id)}
                className="inline-flex items-center text-white bg-[#C67F90] hover:bg-[#b36a7a] transition px-4 py-2.5 rounded-md text-sm font-medium"
              >
                Buy now
                <svg
                  className="w-4 h-4 ml-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 12H5m14 0-4 4m4-4-4-4"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Card;