// src/app/admin/overview/page.jsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminGetOverview, adminPayoutPrize } from "@/lib/api";

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState(null);

  const load = () =>
    adminGetOverview()
      .then((d) => {
        setData(d);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));

  useEffect(() => {
    load();
  }, []);

  const handlePayout = async (tournamentId) => {
    setPayingId(tournamentId);
    setError(null);
    try {
      await adminPayoutPrize(tournamentId);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setPayingId(null);
    }
  };

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
        <p className="text-ember-400">Couldn't load the overview.</p>
      </main>
    );
  }

  const stats = [
    { label: "Total top-ups", value: data.totalTopUps },
    { label: "Total wallet balance held", value: data.totalWalletBalance },
    { label: "Booking revenue", value: data.totalBookingRevenue, note: `${data.paidBookingsCount} paid bookings` },
    { label: "Prize paid out", value: data.totalPrizePaidOut },
  ];

  return (
    <main className="min-h-screen bg-ash-950 font-body px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-bone-100 mb-6">
          Payment overview
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="bg-ash-800 border border-ash-700 p-5">
              <p className="text-xs text-bone-400">{s.label}</p>
              <p className="font-display text-2xl text-ember-400">৳{s.value.toLocaleString()}</p>
              {s.note && <p className="text-xs text-bone-400 mt-1">{s.note}</p>}
            </div>
          ))}
        </div>

        <h2 className="font-display text-xl text-bone-100 mb-3">Pending prize payouts</h2>
        {error && <p className="text-sm text-ember-400 mb-3">{error}</p>}

        {data.pendingPayouts.length === 0 ? (
          <p className="text-sm text-bone-400">Nothing pending — all announced results are paid out.</p>
        ) : (
          <div className="flex flex-col divide-y divide-ash-700 border border-ash-700">
            {data.pendingPayouts.map((t) => (
              <div key={t._id} className="flex items-center justify-between px-4 py-3 bg-ash-800">
                <div>
                  <p className="font-display text-bone-100">{t.title}</p>
                  <p className="text-xs text-bone-400">
                    Winner: {t.result.winnerTeam} · Prize ৳{t.prizePool}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/tournaments/${t._id}/bookings`}
                    className="text-xs text-bone-400 hover:text-ember-400"
                  >
                    View bookings
                  </Link>
                  <button
                    onClick={() => handlePayout(t._id)}
                    disabled={payingId === t._id}
                    className="bg-gold-400 hover:opacity-90 disabled:bg-ash-700 text-ash-950 font-display text-sm font-semibold px-3 py-2"
                  >
                    {payingId === t._id ? "Paying…" : "Pay to wallet"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

