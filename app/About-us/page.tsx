"use client";

import Image from "next/image";
import { useEffect } from "react";
import AOS from "aos";

export default function AboutUs() {

    useEffect(() => {
        AOS.init({
            duration: 900,
            easing: "ease-out-cubic",
            once: true,
        });
    }, []);

    return (
        <section className="w-full bg-[#F9FAFB]">
            {/* Header */}
            <div
                data-aos="fade-down"
                className="pt-10 text-center"
            >
                <h1 className="text-4xl font-bold text-black">About us</h1>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-10">
                {/* Image */}
                <div
                    data-aos="zoom-in"
                    className="flex justify-center"
                >
                    <div className="relative w-full max-w-4xl h-72 md:h-96 rounded-xl overflow-hidden shadow-lg">
                        <Image
                            src="/about1.png"
                            alt="Our team"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* Text */}
                <div className="mt-10 space-y-6 text-gray-700 text-lg leading-relaxed text-center">
                    <p data-aos="fade-up" data-aos-delay="100">
                        At Missrose.com.pk, we take pride in being the official and most trusted Miss Rose website in Pakistan. For years, we have served customers across the country with 100% genuine, authentic Miss Rose products, complete transparency, and an unmatched shopping experience.
                    </p>

                    <p data-aos="fade-up" data-aos-delay="200">
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
