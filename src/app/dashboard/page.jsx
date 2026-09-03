// src/app/dashboard/page.jsx
//
// Lists the player's bookings. When room.isRevealed is true (flipped
// by the backend cron job ~10 min before match start), show the
// Room ID/password; otherwise show a countdown-style placeholder.

"use client";

import { useEffect, useState } from "react";
import { getMyBookings } from "@/lib/api";

export default function DashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    getMyBookings()
      .then((data) => {
        setBookings(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));

    // Optional: poll every 30s so the reveal shows up without a
    // manual refresh once the cron job flips isRevealed. Swap for
    // a Socket.io listener if you've wired that up on the backend.
    const interval = setInterval(() => {
      getMyBookings().then(setBookings).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-ash-950 font-body px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-bone-100 mb-6">
          Your matches
        </h1>

        {status === "loading" && <p className="text-bone-400">Loading…</p>}
        {status === "error" && (
          <p className="text-ember-400">Couldn't load your bookings.</p>
        )}
        {status === "ready" && bookings.length === 0 && (
          <p className="text-bone-400">
            No bookings yet — go book a tournament to see it here.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-ash-800 border border-ash-700 p-5 flex flex-col gap-3"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-lg text-bone-100">
                  {b.tournament.title}
                </h3>
                <span className="text-xs text-bone-400">
                  {new Date(b.tournament.schedule).toLocaleString("en-US", {
                    weekday: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <p className="text-sm text-bone-400">Team: {b.teamName}</p>

              {b.tournament.room?.isRevealed ? (
                <div className="border border-gold-400/40 bg-gold-400/5 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gold-400">Room ID</p>
                    <p className="font-display text-lg text-bone-100">
                      {b.tournament.room.roomId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gold-400">Password</p>
                    <p className="font-display text-lg text-bone-100">
                      {b.tournament.room.password}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-ash-700 px-4 py-3">
                  <p className="text-sm text-bone-400">
                    Room ID unlocks 10 minutes before match time.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
