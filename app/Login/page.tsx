"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import toast, { Toaster } from "react-hot-toast";

import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { auth } from "../lib/firebase";

interface LoginFormInputs {
  email: string;
  password: string;
  role: "customer" | "admin";
}

const schema: yup.ObjectSchema<LoginFormInputs> = yup
  .object({
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    password: yup.string().required("Password is required"),
    role: yup
      .mixed<LoginFormInputs["role"]>()
      .oneOf(["customer", "admin"], "Role is required")
      .required("Role is required"),
  })
  .required();

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      role: "customer",
    },
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    if (!auth) {
      toast.error("Authentication service is unavailable.");
      return;
    }

    setIsSubmitting(true);

    try {

      const loginUser = await signInWithEmailAndPassword(auth, data.email, data.password);

      console.log("bisma loginUser", loginUser);
      
      toast.success("Login Successful");

      setTimeout(() => {
        if (data.role === "admin") {
          router.push("/Dashboard");
        } else {
          router.push("/");
        }
      }, 500);

    } catch (err) {
      const error = err as FirebaseError;

      if (error.code === "auth/user-not-found") {
        setError("email", { message: "User not found" });
      } else if (error.code === "auth/wrong-password") {
        setError("password", { message: "Wrong password" });
      } else {
        toast.error("Login failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Login to Your Account
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Role Dropdown */}
            <div>
              <select
                {...register("role")}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2
                ${errors.role
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                  }`}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>

              {errors.role && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                {...register("email")}
                className={`w-full px-4 py-3 border rounded-lg placeholder-[#CA7E93] focus:outline-none focus:ring-2 
                ${errors.email
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                  }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Password"
                {...register("password")}
                className={`w-full px-4 py-3 border rounded-lg placeholder-[#CA7E93] focus:outline-none focus:ring-2
                ${errors.password
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                  }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#C67F90] text-white hover:bg-pink-600 font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-60"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            {/* Signup */}
            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/Sign-up"
                className="text-[#CA7E93] hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>

          </form>
        </div>
      </div>
    </>
  );
}
