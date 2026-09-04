// src/app/admin/tournaments/[id]/edit/page.jsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TournamentForm from "@/components/admin/TournamentForm";
import {
  getTournamentById,
  adminUpdateTournament,
  adminSetRoomDetails,
  adminAnnounceResult,
  adminPayoutPrize,
} from "@/lib/api";

export default function EditTournamentPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);

  const load = () => getTournamentById(id).then(setTournament);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!tournament) {
    return (
      <main className="min-h-screen bg-ash-950 flex items-center justify-center">
        <p className="text-bone-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ash-950 font-body px-6 py-12">
      <div className="mx-auto max-w-lg flex flex-col gap-10">
        <section>
          <h1 className="font-display text-2xl font-bold text-bone-100 mb-6">
            Edit tournament
          </h1>
          <TournamentForm
            initial={{
              ...tournament,
              totalSlots: tournament.slots.total,
              schedule: toLocalInputValue(tournament.schedule),
            }}
            submitLabel="Save changes"
            onSubmit={async (form) => {
              await adminUpdateTournament(id, form);
              await load();
            }}
          />
        </section>

        <RoomDetailsSection tournament={tournament} onSaved={load} />
        <ResultSection tournament={tournament} onSaved={load} />
      </div>
    </main>
  );
}

function toLocalInputValue(isoDate) {
  // datetime-local inputs need "YYYY-MM-DDTHH:mm" in local time
  const d = new Date(isoDate);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function RoomDetailsSection({ tournament, onSaved }) {
  const [roomId, setRoomId] = useState(tournament.room?.roomId || "");
  const [password, setPassword] = useState(tournament.room?.password || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (revealNow) => {
    setSaving(true);
    try {
      await adminSetRoomDetails(tournament._id, { roomId, password, revealNow });
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="border-t border-ash-700 pt-8">
      <h2 className="font-display text-xl text-bone-100 mb-1">Room details</h2>
      <p className="text-sm text-bone-400 mb-4">
        {tournament.room?.isRevealed
          ? "Already visible to players."
          : "Auto-reveals to players 10 minutes before schedule, once set here."}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <label className="block">
          <span className="text-sm text-bone-400">Room ID</span>
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="mt-1 w-full bg-ash-800 border border-ash-700 px-3 py-2 text-bone-100 focus:outline-none focus:border-ember-500"
          />
        </label>
        <label className="block">
          <span className="text-sm text-bone-400">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full bg-ash-800 border border-ash-700 px-3 py-2 text-bone-100 focus:outline-none focus:border-ember-500"
          />
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="flex-1 border border-ash-700 hover:border-ember-500 text-bone-100 font-display py-2"
        >
          Save (auto-reveal later)
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="flex-1 bg-ember-500 hover:bg-ember-600 text-ash-950 font-display font-semibold py-2"
        >
          Save & reveal now
        </button>
      </div>
    </section>
  );
}

function ResultSection({ tournament, onSaved }) {
  const [winnerTeam, setWinnerTeam] = useState(tournament.result?.winnerTeam || "");
  const [saving, setSaving] = useState(false);
  const [payingOut, setPayingOut] = useState(false);
  const [payoutError, setPayoutError] = useState(null);

  const handleAnnounce = async () => {
    setSaving(true);
    try {
      await adminAnnounceResult(tournament._id, winnerTeam);
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  const handlePayout = async () => {
    setPayingOut(true);
    setPayoutError(null);
    try {
      await adminPayoutPrize(tournament._id);
      await onSaved();
    } catch (err) {
      setPayoutError(err.message);
    } finally {
      setPayingOut(false);
    }
  };

  const payoutStatus = tournament.result?.payoutStatus;

  return (
    <section className="border-t border-ash-700 pt-8">
      <h2 className="font-display text-xl text-bone-100 mb-1">Result</h2>
      <p className="text-sm text-bone-400 mb-4">
        {tournament.result?.announced
          ? `Winner announced: ${tournament.result.winnerTeam}`
          : "Not announced yet."}
      </p>

      <label className="block mb-4">
        <span className="text-sm text-bone-400">Winning team</span>
        <input
          value={winnerTeam}
          onChange={(e) => setWinnerTeam(e.target.value)}
          className="mt-1 w-full bg-ash-800 border border-ash-700 px-3 py-2 text-bone-100 focus:outline-none focus:border-ember-500"
          placeholder="e.g. Ember Wolves"
        />
      </label>

      <button
        onClick={handleAnnounce}
        disabled={saving || !winnerTeam}
        className="w-full bg-gold-400 hover:opacity-90 disabled:bg-ash-700 disabled:text-bone-400 text-ash-950 font-display font-semibold py-3"
      >
        {saving ? "Announcing…" : "Announce winner"}
      </button>

      {/* Payout only matters once a winner is announced and there's
          a prize pool to hand out. */}
      {payoutStatus === "pending" && (
        <div className="mt-4">
          <p className="text-sm text-bone-400 mb-2">
            Prize of ৳{tournament.prizePool} not yet paid out.
          </p>
          {payoutError && <p className="text-sm text-ember-400 mb-2">{payoutError}</p>}
          <button
            onClick={handlePayout}
            disabled={payingOut}
            className="w-full border border-gold-400 text-gold-400 hover:bg-gold-400/10 disabled:opacity-40 font-display font-semibold py-3"
          >
            {payingOut ? "Paying…" : `Pay ৳${tournament.prizePool} to winner's wallet`}
          </button>
        </div>
      )}
      {payoutStatus === "paid" && (
        <p className="mt-4 text-sm text-gold-400">
          ✓ Prize paid out {tournament.result.payoutAt ? `on ${new Date(tournament.result.payoutAt).toLocaleDateString()}` : ""}
        </p>
      )}
    </section>
  );
}
