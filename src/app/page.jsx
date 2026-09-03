// src/app/page.jsx
//
// Home + tournament list in one page. Fetches from the backend on
// mount; falls back to a loading/empty state rather than blocking.

"use client";

import { useEffect, useState } from "react";
import { getTournaments } from "@/lib/api";
import TournamentCard from "@/components/TournamentCard";

export default function HomePage() {
  const [tournaments, setTournaments] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    getTournaments({ status: "upcoming" })
      .then((data) => {
        setTournaments(data.tournaments || []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <main className="min-h-screen bg-ash-950 font-body">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ash-700 px-6 py-16 sm:py-24">
        <div
          className="absolute -right-24 top-0 h-full w-1/2 bg-ember-600/10"
          style={{ clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0% 100%)" }}
        />
        <div className="relative mx-auto max-w-3xl">
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-bone-100 leading-[1.05]">
            Squad up.
            <br />
            <span className="text-ember-500">Claim the arena.</span>
          </h1>
          <p className="mt-4 max-w-md font-body text-bone-400">
            Book a slot, get your Room ID ten minutes before match time, and
            fight for the prize pool.
          </p>
        </div>
      </section>

      {/* Tournament grid */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-display text-2xl font-semibold text-bone-100 mb-6">
          Upcoming tournaments
        </h2>

        {status === "loading" && (
          <p className="font-body text-bone-400">Loading tournaments…</p>
        )}

        {status === "error" && (
          <p className="font-body text-ember-400">
            Couldn't load tournaments. Check your connection and try again.
          </p>
        )}

        {status === "ready" && tournaments.length === 0 && (
          <p className="font-body text-bone-400">
            No tournaments open right now — check back soon.
          </p>
        )}

        {status === "ready" && tournaments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((t) => (
              <TournamentCard key={t._id} tournament={t} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
