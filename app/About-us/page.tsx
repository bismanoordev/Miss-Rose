"use client";

import Image from "next/image";

export default function AboutUs() {

    return (
        <section className="w-full bg-[#F9FAFB] py-20 font-serif">
            {/* Header */}
            <div
                
                className=" pb-9 text-center"
            >
                <h1 className="text-4xl font-serif font-bold text-black">About us</h1>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-10">
                {/* Image */}
                <div
                   
                    className="flex justify-center"
                >
                    <div className="relative w-full max-w-4xl mb-6  h-72 md:h-96 rounded-xl overflow-hidden shadow-lg">
                        <Image
                            src="/about1.png"
                            alt="Our team"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* Text */}
                <div className="mt-10 space-y-8 text-gray-700 text-lg leading-relaxed text-center">
                    <p>
                        At Missrose.com.pk, we take pride in being the official and most trusted Miss Rose website in Pakistan. For years, we have served customers across the country with 100% genuine, authentic Miss Rose products, complete transparency, and an unmatched shopping experience.
                    </p>

                    <p>
                        Your trust means everything to us.
                        As the brand has grown, several websites have appeared with similar names, which sometimes creates confusion for customers. We want to assure you that Missrose.com.pk is the official and authentic Miss Rose platform in Pakistan.

                        Every product we sell is original, quality-checked, ensuring you receive the beauty products you love—with confidence.

                        Thank you for trusting us and being a part of the Miss Rose family.
                        We are committed to providing you with the best beauty experience, every single day.
                    </p>
                </div>
            </div>
        </section>
    );
}
