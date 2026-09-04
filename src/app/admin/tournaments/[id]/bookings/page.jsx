// src/app/admin/tournaments/[id]/bookings/page.jsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminGetTournamentBookings, getTournamentById } from "@/lib/api";

export default function TournamentBookingsPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    Promise.all([getTournamentById(id), adminGetTournamentBookings(id)])
      .then(([t, b]) => {
        setTournament(t);
        setBookings(b);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-ash-950 flex items-center justify-center">
        <p className="text-bone-400">Loading…</p>
      </main>
    );
  }
  if (status === "error") {
    return (
      <main className="min-h-screen bg-ash-950 flex items-center justify-center">
        <p className="text-ember-400">Couldn't load bookings.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ash-950 font-body px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-2xl font-bold text-bone-100 mb-1">
          {tournament.title} — Bookings
        </h1>
        <p className="text-sm text-bone-400 mb-6">
          {bookings.length} of {tournament.slots.total} slots booked
        </p>

        {bookings.length === 0 ? (
          <p className="text-sm text-bone-400">No one has booked yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-ash-700 border border-ash-700">
            {bookings.map((b) => (
              <div key={b._id} className="flex items-center justify-between px-4 py-3 bg-ash-800">
                <div>
                  <p className="font-display text-bone-100">{b.teamName || "(no team name)"}</p>
                  <p className="text-xs text-bone-400">
                    {b.user?.name} · {b.user?.email}
                    {b.user?.ign ? ` · IGN: ${b.user.ign}` : ""}
                  </p>
                  {b.playerIGNs?.length > 0 && (
                    <p className="text-xs text-bone-400">Squad: {b.playerIGNs.join(", ")}</p>
                  )}
                </div>
                <span
                  className={`text-xs font-display px-2 py-1 ${
                    b.paymentStatus === "paid"
                      ? "text-gold-400"
                      : b.paymentStatus === "pending"
                      ? "text-bone-400"
                      : "text-ember-400"
                  }`}
                >
                  {b.paymentStatus}
                  {b.payment?.method ? ` · ${b.payment.method}` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
