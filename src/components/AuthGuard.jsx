// src/components/AuthGuard.jsx
//
// Wraps every page via the root layout. If there's no logged-in
// user and the current page isn't /login or /register, redirect to
// /login before rendering anything else. This makes the whole site
// login-first instead of letting people browse anonymously.

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/register"];

export default function AuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.includes(pathname);
    const user = getCurrentUser();

    if (!user && !isPublic) {
      router.replace("/login");
      return; // don't flip `checked` — we're navigating away
    }
    setChecked(true);
  }, [pathname, router]);

  // Avoid flashing protected content for a split second before the
  // redirect kicks in.
  if (!checked) return null;

  return children;
}
