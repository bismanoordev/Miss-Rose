"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import AOS from "aos";
import toast from "react-hot-toast";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    country: "Pakistan",
  });

  useEffect(() => {
    AOS.init({ duration: 800, once: false });
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.address || !formData.phone) {
      toast.error("Please fill in all required fields ");
      return;
    }

    try {
      await addDoc(collection(db, "orders"), {
        ...formData,
        createdAt: new Date().toISOString(),
      });

      toast.success("Order placed successfully ");

      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        postalCode: "",
        phone: "",
        country: "Pakistan",
      });
    } catch (error) {
      toast.error("Error saving order. Please try again ");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 my-10" data-aos="fade-up">
      <h1 className="text-4xl font-semibold mb-4 text-center">Delivery</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Email or mobile phone number"
          className="w-full border p-3 rounded"
          onChange={handleChange}
          required
        />

        <select
          name="country"
          value={formData.country}
          className="w-full border p-3 rounded"
          onChange={handleChange}
        >
          <option>Pakistan</option>
        </select>

        <div className="grid grid-cols-2 gap-3">
          <input
            name="firstName"
            value={formData.firstName}
            placeholder="First name (optional)"
            className="border p-3 rounded"
            onChange={handleChange}
          />
          <input
            name="lastName"
            value={formData.lastName}
            placeholder="Last name"
            className="border p-3 rounded"
            onChange={handleChange}
          />
        </div>

        <input
          name="address"
          value={formData.address}
          placeholder="Address"
          className="w-full border p-3 rounded"
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            name="city"
            value={formData.city}
            placeholder="City"
            className="border p-3 rounded"
            onChange={handleChange}
          />
          <input
            name="postalCode"
            value={formData.postalCode}
            placeholder="Postal code (optional)"
            className="border p-3 rounded"
            onChange={handleChange}
          />
        </div>

        <input
          name="phone"
          value={formData.phone}
          placeholder="Phone"
          className="w-full border p-3 rounded"
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition"
        >
          Complete order
        </button>
      </form>
    </div>
  );
}
