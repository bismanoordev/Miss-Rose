"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import toast, { Toaster } from "react-hot-toast";

import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { auth } from "../lib/firebase"; // make sure this is the fixed firebase.ts file

interface SignupFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
}

const schema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
});

export default function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignupFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
    if (!auth) {
      toast.error("Authentication service is unavailable.");
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      console.log("User created:", userCredential.user); // ✅ debug

      toast.success("Account created successfully");

      // ✅ delay so toast shows properly before redirect
      setTimeout(() => {
        router.push("/"); // redirect to home
      }, 500);
    } catch (err) {
      const error = err as FirebaseError;
      console.log("Firebase signup error:", error);

      if (error.code === "auth/email-already-in-use") {
        setError("email", { message: "Email already in use" });
      } else if (error.code === "auth/weak-password") {
        setError("password", { message: "Weak password" });
      } else {
        toast.error(error.message || "Signup failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ✅ TOASTER */}
      <Toaster position="top-right" />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Create an Account
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                {...register("email")}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 
                  ${errors.email
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"}`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Password"
                {...register("password")}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 
                  ${errors.password
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"}`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                {...register("confirmPassword")}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 
                  ${errors.confirmPassword
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"}`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/Login" // ✅ lowercase fixed
                className="text-blue-600 hover:underline font-medium"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
