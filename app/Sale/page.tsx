"use client";

import Link from "next/link";

const products = [
  { id: "1", img: "card1.png", title: "Miss Rose Silk Flawless Foundation" },
  { id: "2", img: "card2.png", title: "Miss Rose Full Coverage Concealer" },
  { id: "3", img: "card3.png", title: "Miss Rose Perfect Cover 24H Hydrating Concealer" },
  { id: "4", img: "card4.png", title: "Miss Rose Full Coverage Matte Foundation" },
  { id: "5", img: "card5.png", title: "Miss Rose Silk Radiance BB Cream" },
  { id: "6", img: "card6.png", title: "Miss Rose Glossy Gloss Lip Comfort" },
  { id: "7", img: "card7.png", title: "Miss Rose Cat Eye Mascara Permanent" },
  { id: "8", img: "card8.png", title: "Miss Rose Two Way Compact Powder" },
];

const Card = () => {
  return (
    <div>
      <h1
        className="text-black mt-4 text-4xl text-center pt-10 pb-5 leading-relaxed font-serif"
      >
        Enjoy UPTO 70% OFF Sale
      </h1>

      <div className="p-9 flex gap-5 flex-wrap font-serif justify-center">
        {products.map((item, index) => (
          <div
            key={index}
            className="
              bg-neutral-primary-soft block max-w-2xs 
              border border-gray-300 rounded-2xl shadow-xs
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

            <div className="p-3 text-center rounded-b-2xl">
              <h5 className="mt-3 mb-3 text-lg font-semibold tracking-tight text-heading">
                {item.title}
              </h5>

              <Link
                href={`/ProductForm?productId=${item.id}`}
                className="
                  inline-flex items-center text-white bg-[#C67F90] hover:bg-[#b36a7a]
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

      <div
        className="flex font-serif justify-center mb-6"
      >
        <Link
          href="/All"
          className="
            inline-flex items-center text-white bg-[#C67F90] hover:bg-[#b36a7a]
            transition-colors duration-300
            focus:ring-4 focus:ring-brand-medium
            shadow-xs font-medium text-sm
            px-5 py-2.5 rounded-md focus:outline-none
          "
        >
          View All
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
  );
};

export default Card;