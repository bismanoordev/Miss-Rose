"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AOS from "aos";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase"; // path apne project ke hisaab se check kar lena

const products = [
  { img: "card1.png", title: "Miss Rose Silk Flawless Foundation" },
  { img: "card2.png", title: "Miss Rose Full Coverage Concealer" },
  { img: "card3.png", title: "Miss Rose Perfect Cover 24H Hydrating Concealer" },
  { img: "card4.png", title: "Miss Rose Full Coverage Matte Moundation." },
  { img: "card5.png", title: "Miss Rose Silk Radiancs BB Cream" },
  { img: "card6.png", title: "Miss Rose Glossy Gloss Lip Comfort" },
  { img: "card7.png", title: "Miss Rose Cat Eye Mascara Perminent" },
  { img: "card8.png", title: "Miss Rose Two Way Compact Powder" },
  { img: "card1.png", title: "Miss Rose Two Way Compact Powder" },
  { img: "card8.png", title: "Miss Rose Two Way Compact Powder" },
  { img: "card5.png", title: "Miss Rose Two Way Compact Powder" },
  { img: "card2.png", title: "Miss Rose Two Way Compact Powder" },
];

const Card = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: false,
    });

    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsub();
  }, []);

  const handleBuyNow = () => {
    if (!user) {
      router.push("/Login"); // ya /Sign-up
    } else {
      router.push("/Product-Form");
    }
  };

  return (
    <div>
      <h1
        data-aos="fade-down"
        className="text-black mt-9 text-5xl text-center leading-relaxed font-serif"
      >
        SHOP ALL
      </h1>

      <div className="p-9 pb-20 flex gap-5 flex-wrap justify-center">
        {products.map((item, index) => (
          <div
            key={index}
            data-aos="fade-up"
            data-aos-delay={index * 80}
            className="bg-neutral-primary-soft block max-w-2xs border border-default rounded-2xl shadow-xs transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]"
          >
            <img
              className="h-52 w-100 rounded-t-2xl"
              src={item.img}
              alt={item.title}
            />

            <div className="p-3 text-center bg-[#F3F3F3] rounded-2xl">
              <h5 className="mt-3 mb-3 text-lg font-semibold">
                {item.title}
              </h5>

              <button
                onClick={handleBuyNow}
                className="inline-flex items-center text-white bg-black hover:bg-gray-800 transition px-4 py-2.5 rounded-md text-sm font-medium"
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
