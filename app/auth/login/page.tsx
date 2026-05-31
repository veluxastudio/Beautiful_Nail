"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Login
          </h1>

          <p className="text-gray-500 mt-2">
            Welcome back admin
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter email"
              className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/40 focus:border-[#ff2056]/50"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff2056]/40 focus:border-[#ff2056]/50"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff2056] hover:bg-[#d9003f] text-white rounded-xl py-3 font-medium transition-all"
          >
            {loading
              ? "Loading..."
              : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}