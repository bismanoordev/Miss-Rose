"use client";

import Link from "next/link";
import { useEffect } from "react";
import AOS from "aos";

const products = [
  { img: "card1.png", title: "Miss Rose Silk Flawless Foundation" },
  { img: "card2.png", title: "Miss Rose Full Coverage Concealer" },
  { img: "card3.png", title: "Miss Rose Perfect Cover 24H Hydrating Concealer" },
  { img: "card4.png", title: "Miss Rose Full Coverage Matte Moundation." },
  { img: "card5.png", title: "Miss Rose Silk Radiancs BB Cream" },
  { img: "card6.png", title: "Miss Rose Glossy Gloss Lip Comfort" },
  { img: "card7.png", title: "Miss Rose Cat Eye Mascara Perminent" },
  { img: "card8.png", title: "Miss Rose Two Way Compact Powder" },
  { img: "card9.png", title: "Miss Rose Purely Natural Foundation - Miss Rose Com Pak" },
  { img: "card10.png", title: "Miss Rose Silk Flawless Foundation Ivory 6 - Urban Beauty" },
  { img: "card11.png", title: "Miss Rose Silk Flawless Foundation Ivory 6 - Urban Beauty" },
  { img: "card12.png", title: "Miss Rose Silk Flawless Foundation Ivory 6 - Urban Beauty" },
  { img: "card13.png", title: "Miss Rose Silk Flawless Foundation Ivory 6 - Urban Beauty" },
  { img: "card4.png", title: "Miss Rose Silk Flawless Foundation Ivory 6 - Urban Beauty" },
  { img: "card8.png", title: "Miss Rose Silk Flawless Foundation Ivory 6 - Urban Beauty" },
  { img: "card10.png", title: "Miss Rose Silk Flawless Foundation Ivory 6 - Urban Beauty" },
];

const Card = () => {

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

  return (
    <div>
      <h1
        data-aos="fade-down"
        className="text-black mt-4 text-4xl text-center leading-relaxed font-serif"
      >
        Enjoy UPTO 70% OFF Sale
      </h1>

      <div className="p-9 flex gap-5 flex-wrap justify-center">
        {products.map((item, index) => (
          <div
            key={index}
            data-aos="fade-up"
            data-aos-delay={index * 80}
            className="
              bg-neutral-primary-soft block max-w-2xs 
              border border-default rounded-2xl shadow-xs
              transition-all duration-300 ease-in-out
              hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]
            "
          >
            <a href="#">
              <img
                className="h-52 w-100 rounded-t-2xl"
                src={item.img}
                alt={item.title}
              />
            </a>

            <div className="p-2 text-center bg-[#F3F3F3] rounded-2xl">
              <h5 className="mt-4 mb-4 text-lg font-semibold tracking-tight text-heading">
                {item.title}
              </h5>

              <Link
                href="/Product-Form"
                className="
                  inline-flex items-center text-white bg-black
                  hover:bg-gray-800
                  transition-colors duration-300
                  focus:ring-4 focus:ring-brand-medium
                  rounded-md shadow-xs font-medium text-sm
                  px-4 py-2.5 rounded-base focus:outline-none
                "
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
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Card;
