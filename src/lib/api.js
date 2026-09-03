// src/lib/api.js
//
// Single Axios instance + typed helper functions. Every component
// imports from here instead of calling axios directly, so the base
// URL, auth token, and error handling live in one place.

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT (if the user is logged in) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors so components can just read err.message.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

// ---- Auth ----
export const registerUser = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data; // { token, user }
};

export const loginUser = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data; // { token, user }
};

// ---- Tournaments ----
export const getTournaments = async (params) => {
  const { data } = await api.get("/tournaments", { params });
  return data.tournaments;
};

export const getTournamentById = async (id) => {
  const { data } = await api.get(`/tournaments/${id}`);
  return data.tournament;
};

// ---- Booking / Payment ----
// Always call this to book a slot, whether the tournament is free
// or paid. Free tournaments come back confirmed immediately; paid
// ones come back with a Razorpay order to open Checkout with.
export const createBookingOrder = async (tournamentId, { teamName, playerIGNs }) => {
  const { data } = await api.post(`/payments/tournaments/${tournamentId}/create-order`, {
    teamName,
    playerIGNs,
  });
  return data;
};

export const cancelBooking = async (bookingId) => {
  const { data } = await api.delete(`/bookings/${bookingId}`);
  return data;
};

// ---- Dashboard ----
export const getMyBookings = async () => {
  const { data } = await api.get("/bookings/me");
  return data.bookings; // each booking includes populated tournament + room fields
};

// ---- Admin ----
export const adminCreateTournament = async (payload) => {
  const { data } = await api.post("/admin/tournaments", payload);
  return data.tournament;
};

export const adminUpdateTournament = async (id, payload) => {
  const { data } = await api.put(`/admin/tournaments/${id}`, payload);
  return data.tournament;
};

export const adminSetRoomDetails = async (id, payload) => {
  const { data } = await api.patch(`/admin/tournaments/${id}/room`, payload);
  return data.tournament;
};

export const adminAnnounceResult = async (id, winnerTeam) => {
  const { data } = await api.patch(`/admin/tournaments/${id}/result`, { winnerTeam });
  return data.tournament;
};

export default api;
