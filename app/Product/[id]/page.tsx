"use client";

import { useParams, useRouter } from "next/navigation";

const products = [
    { id: "1", img: "card1.png", title: "Miss Rose Silk Flawless Foundation" },
    { id: "2", img: "card2.png", title: "Miss Rose Full Coverage Concealer" },
    { id: "3", img: "card3.png", title: "Miss Rose Perfect Cover 24H Hydrating Concealer" },
    { id: "4", img: "card4.png", title: "Miss Rose Full Coverage Matte Foundation" },
    { id: "5", img: "card5.png", title: "Miss Rose Silk Radiance BB Cream" },
    { id: "6", img: "card6.png", title: "Miss Rose Glossy Gloss Lip Comfort" },
    { id: "7", img: "card7.png", title: "Miss Rose Cat Eye Mascara Permanent" },
    { id: "8", img: "card8.png", title: "Miss Rose Two Way Compact Powder" },
    { id: "9", img: "card9.png", title: "Miss Rose Perfect Cover 24H Hydrating Concealer" },
    { id: "10", img: "card10.png", title: "Miss Rose Full Coverage Matte Foundation" },
    { id: "11", img: "card11.png", title: "Miss Rose Full Coverage Matte Foundation" },
    { id: "12", img: "card12.png", title: "Miss Rose Full Coverage Matte Foundation" },
];

export default function ProductDetail() {
    const { id } = useParams();
    const router = useRouter();

    const product = products.find((p) => p.id === id);

    if (!product) {
        return <p className="text-center mt-10">Product not found</p>;
    }

    return (
        <div className="min-h-screen font flex items-center justify-center p-6">
            <div className="max-w-lg bg-white rounded-xl shadow-lg p-6">
                <img
                    src={`/${product.img}`}
                    alt={product.title}
                    className="w-full object-cover rounded-lg"
                />

                <h1 className="text-2xl font-bold mt-4 text-center">{product.title}</h1>

                <p className="text-gray-600 mt-2 ">
                    This is a premium Miss Rose product with high quality and long-lasting results. Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi molestiae iure tempore ratione dolor perspiciatis ullam Sit dolorem atque blanditiis enim minus consequatur provident magnam quibusdam quis ipsam at velit.
                </p>


                <button
                    onClick={() => router.push("/Product-Form")}
                    className="mt-6 w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800"
                >
                    Proceed to Order
                </button>

                <button
                onClick={() => router.push("/Shop")}
                    className="mt-6 w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
