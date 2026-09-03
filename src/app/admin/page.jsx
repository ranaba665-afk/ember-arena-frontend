// src/app/admin/page.jsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTournaments } from "@/lib/api";
import { isAdmin } from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!isAdmin()) {
      router.replace("/login");
      return;
    }
    getTournaments({})
      .then((data) => {
        setTournaments(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [router]);

  return (
    <main className="min-h-screen bg-ash-950 font-body px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-bone-100">Admin panel</h1>
          <Link
            href="/admin/tournaments/new"
            className="bg-ember-500 hover:bg-ember-600 text-ash-950 font-display font-semibold px-4 py-2"
          >
            + New tournament
          </Link>
        </div>

        {status === "loading" && <p className="text-bone-400">Loading…</p>}
        {status === "error" && <p className="text-ember-400">Couldn't load tournaments.</p>}

        {status === "ready" && (
          <div className="flex flex-col divide-y divide-ash-700 border border-ash-700">
            {tournaments.map((t) => (
              <Link
                key={t._id}
                href={`/admin/tournaments/${t._id}/edit`}
                className="flex items-center justify-between px-4 py-3 bg-ash-800 hover:bg-ash-700 transition-colors"
              >
                <div>
                  <p className="font-display text-bone-100">{t.title}</p>
                  <p className="text-xs text-bone-400">
                    {new Date(t.schedule).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-bone-400">
                    {t.slots.remaining}/{t.slots.total} slots
                  </span>
                  <span
                    className={
                      t.status === "live"
                        ? "text-gold-400"
                        : t.status === "completed"
                        ? "text-bone-400"
                        : "text-ember-400"
                    }
                  >
                    {t.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
