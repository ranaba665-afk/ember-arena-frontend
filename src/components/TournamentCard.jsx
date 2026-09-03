// src/components/TournamentCard.jsx
//
// A single tournament entry. The slanted image edge + corner slot
// counter read as "battle royale lobby" rather than a generic
// rounded SaaS card.

import Link from "next/link";

export default function TournamentCard({ tournament }) {
  const { _id, title, banner, entryFee, prizePool, slots, schedule, status } = tournament;

  const slotsLeft = slots.remaining;
  const isFull = slotsLeft === 0;
  const startsAt = new Date(schedule).toLocaleString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Link
      href={`/tournaments/${_id}`}
      className="group relative flex flex-col overflow-hidden bg-ash-800 border border-ash-700 hover:border-ember-500/60 transition-colors"
    >
      {/* Banner with a slanted bottom edge */}
      <div
        className="relative h-36 w-full overflow-hidden"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" }}
      >
        <img
          src={banner}
          alt={title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ash-900/90 via-ash-900/10 to-transparent" />
        {status === "live" && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-ash-950/80 px-2 py-1 text-xs font-body text-gold-400">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
            Live now
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-display text-xl font-semibold text-bone-100 leading-tight">
          {title}
        </h3>

        <div className="flex items-baseline justify-between">
          <div>
            <p className="font-body text-xs text-bone-400">Prize pool</p>
            <p className="font-display text-lg text-ember-400">৳{prizePool.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="font-body text-xs text-bone-400">Entry fee</p>
            <p className="font-display text-lg text-bone-100">
              {entryFee === 0 ? "Free" : `৳${entryFee}`}
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-ash-700 pt-3 font-body text-sm">
          <span className="text-bone-400">{startsAt}</span>
          <span className={isFull ? "text-bone-400" : "text-gold-400"}>
            {isFull ? "Slots full" : `${slotsLeft}/${slots.total} slots left`}
          </span>
        </div>
      </div>
    </Link>
  );
}
