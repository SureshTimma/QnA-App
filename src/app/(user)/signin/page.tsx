"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const SignIn = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    redirect: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await signIn("credentials", formData);
    console.log("SignIn response:", response);
    if(response?.status==200) {
        router.push("/dashboard");
    } else {
        console.error("SignIn failed:", response);
        alert("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-[#00B9F1] py-1 px-6 flex justify-center"></div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Sign In to Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent transition"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent transition"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#00B9F1] hover:bg-[#00a3d6] text-white py-3 rounded-lg transition duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#008bbc] focus:ring-offset-2"
            >
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <span
              className="text-[#00B9F1] hover:text-[#00a3d6] font-medium cursor-pointer"
              onClick={() => router.push("signup")}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
