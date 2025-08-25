"use client";
import { login, upgradeToSeller } from "@/lib/api/auth";
import { useAppStore } from "@/store/store";
import { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUserInfo, setToast } = useAppStore();
  const router = useRouter();

  const { startLoading, stopLoading, isLoading } = useAppStore();
  const loadingKey = "login";

  const handleSignIn = async () => {
    if (!email || !password) {
      setToast("Email and Password is required to login.");
      return;
    }
    if (isLoading(loadingKey)) return;
  startLoading(loadingKey, "Đang đăng nhập... Vui lòng chờ");
    try {
      const response = await login(email, password);
      if (response instanceof AxiosError) {
        setToast(response?.response?.data.message || "Login failed");
      } else if (response?.username) {
        setUserInfo(response);
        const roles: string[] = Array.isArray(response.roles)
          ? response.roles
          : [];
        const isSeller = roles.includes("seller");
        const isAdmin = Boolean(response.isAdmin);
        router.push(isAdmin || isSeller ? "/admin/dashboard" : "/");
      }
    } finally {
      stopLoading(loadingKey);
    }
  };

  const handleUpgrade = async () => {
    const upgraded = await upgradeToSeller();
    if (upgraded?.username) {
      setUserInfo(upgraded);
      setToast("Upgraded to seller");
      router.push("/admin/dashboard");
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <Image
            src="/amazon-logo.png"
            alt="amazon logo"
            height={150}
            width={150}
          />
        </a>
  <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>

            <div className="space-y-4 md:space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@amazon.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      aria-describedby="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="remember"
                      className="text-gray-500 dark:text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>
                </div>
                <a
                  href="#"
                  className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="button"
                disabled={isLoading(loadingKey)}
                className={`w-full flex items-center justify-center gap-2 text-white bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800`}
                onClick={handleSignIn}
              >
                {isLoading(loadingKey) && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                )}
                {isLoading(loadingKey) ? "Signing in..." : "Sign in"}
              </button>
              {/* Amazon style divider */}
              <div className="relative flex items-center justify-center my-4">
                <span className="flex-1 h-px bg-gray-300" />
                <span className="px-3 text-xs text-gray-500 uppercase tracking-wide">New to Amazon?</span>
                <span className="flex-1 h-px bg-gray-300" />
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="w-full bg-gradient-to-b from-yellow-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 border border-yellow-500 rounded-lg text-sm font-medium py-2.5 shadow-sm hover:shadow focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"
                >
                  Create your Amazon account
                </button>
                <button
                  type="button"
                  onClick={handleUpgrade}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium py-2.5 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                >
                  Upgrade to Seller
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center pt-2 dark:text-gray-400">
                By continuing, you agree to Amazon&apos;s <a href="#" className="text-blue-600 hover:underline">Conditions of Use</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Notice</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;
