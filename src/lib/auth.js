// src/lib/auth.js
//
// Thin wrapper around localStorage + the login/register API calls.
// Kept framework-agnostic (no context provider) to keep this step
// simple — swap for a React Context if pages elsewhere need to
// reactively know the logged-in user without a refresh.

import { loginUser, registerUser } from "@/lib/api";

export async function login(email, password) {
  const { token, user } = await loginUser({ email, password });
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  return user;
}

export async function register(payload) {
  const { token, user } = await registerUser(payload);
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function isAdmin() {
  return getCurrentUser()?.role === "admin";
}
