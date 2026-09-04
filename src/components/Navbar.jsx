// src/components/Navbar.jsx

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/lib/auth";

const HIDDEN_ON = ["/login", "/register"];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, [pathname]);

  if (HIDDEN_ON.includes(pathname) || !user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const linkClass = (href) =>
    `text-sm font-body ${pathname === href ? "text-ember-400" : "text-bone-400 hover:text-bone-100"}`;

  return (
    <nav className="sticky top-0 z-10 bg-ash-900 border-b border-ash-700 px-6 py-3">
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        <Link href="/" className="font-display text-lg font-bold text-bone-100">
          Ember <span className="text-ember-500">Arena</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>
          <Link href="/dashboard" className={linkClass("/dashboard")}>
            My matches
          </Link>
          <Link href="/wallet" className={linkClass("/wallet")}>
            Wallet
          </Link>
          {user.role === "admin" && (
            <Link href="/admin" className={linkClass("/admin")}>
              Admin
            </Link>
          )}
          <button onClick={handleLogout} className="text-sm font-body text-bone-400 hover:text-ember-400">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
