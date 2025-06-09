"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SignUp = () => {
  const router = useRouter();
  type UserData = {
    username: string;
    email: string;
    password: string;
  };
  const [userData, setUserData] = useState<UserData>({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const onFormSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/signup", userData);
      router.push("/signin");
    } catch (error: unknown) {
      console.error("Signup error:", error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data?.error || "Registration failed");
      } else {
        setError((error as Error).message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] px-4 py-8">
      <form
        onSubmit={onFormSubmission}
        className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border-t-4 border-[#2e4369] transform transition-all duration-300 hover:translate-y-[-5px]"
      >
        {" "}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center w-16 h-16 bg-[#2e4369] rounded-full mb-4 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-center text-[#2e4369]">
            Create Account
          </h1>
          <p className="text-gray-500 mt-1">Sign up to get started</p>
        </div>        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}
        <div className="mb-5">
          <label
            htmlFor="username"
            className="block mb-1 text-sm font-semibold text-gray-700"
          >
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <input
              type="text"
              id="username"
              name="username"
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Enter your username"
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2e4369] focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block mb-1 text-sm font-semibold text-gray-700"
          >
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>{" "}
            <input
              type="email"
              id="email"
              name="email"
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Enter your email"
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2e4369] focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block mb-1 text-sm font-semibold text-gray-700"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>{" "}
            <input
              type="password"
              id="password"
              name="password"
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Enter your password"
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2e4369] focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>{" "}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-[#2e4369] text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] ${
            isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#3c527d]"
          }`}
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>
        <p className="mt-6 text-center text-sm text-gray-700">
          Already have an account?
          <Link
            href="/signin"
            className="text-[#2e4369] font-semibold hover:underline ml-1 cursor-pointer"
          >
            Sign In
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-gray-700">
          <Link
            href="/"
            className="text-[#2e4369] font-semibold hover:underline cursor-pointer"
          >
            ← Return to Home
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
