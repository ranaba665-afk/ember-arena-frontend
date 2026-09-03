// src/app/admin/tournaments/new/page.jsx

"use client";

import { useRouter } from "next/navigation";
import TournamentForm from "@/components/admin/TournamentForm";
import { adminCreateTournament } from "@/lib/api";

export default function NewTournamentPage() {
  const router = useRouter();

  const handleCreate = async (form) => {
    const tournament = await adminCreateTournament(form);
    router.push(`/admin/tournaments/${tournament._id}/edit`);
  };

  return (
    <main className="min-h-screen bg-ash-950 font-body px-6 py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-2xl font-bold text-bone-100 mb-6">
          Create tournament
        </h1>
        <TournamentForm onSubmit={handleCreate} submitLabel="Create tournament" />
      </div>
    </main>
  );
}
