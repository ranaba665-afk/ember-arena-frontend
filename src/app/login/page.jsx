// src/app/login/page.jsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(form.email, form.password);
      router.push(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-ash-950 flex items-center justify-center px-6 font-body">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-bold text-bone-100 mb-1">Welcome back</h1>
        <p className="text-sm text-bone-400 mb-8">Log in to book your next match.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block">
            <span className="text-sm text-bone-400">Email</span>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full bg-ash-800 border border-ash-700 px-3 py-2 text-bone-100 focus:outline-none focus:border-ember-500"
            />
          </label>

          <label className="block">
            <span className="text-sm text-bone-400">Password</span>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full bg-ash-800 border border-ash-700 px-3 py-2 text-bone-100 focus:outline-none focus:border-ember-500"
            />
          </label>

          {error && <p className="text-sm text-ember-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full bg-ember-500 hover:bg-ember-600 disabled:bg-ash-700 text-ash-950 font-display font-semibold py-3 transition-colors"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-bone-400">
          No account?{" "}
          <Link href="/register" className="text-ember-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
