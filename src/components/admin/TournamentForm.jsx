// src/components/admin/TournamentForm.jsx
//
// Shared by the "new" and "edit" admin pages. Pass `initial` for
// edit mode (pre-fills fields); omit it for create mode.

"use client";

import { useState } from "react";

const empty = {
  title: "",
  gameName: "Free Fire",
  banner: "",
  entryFee: 0,
  prizePool: 0,
  totalSlots: 50,
  schedule: "",
  rules: "",
};

export default function TournamentForm({ initial, onSubmit, submitLabel = "Save" }) {
  const [form, setForm] = useState({ ...empty, ...initial });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((f) => ({ ...f, [name]: type === "number" ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="block">
        <span className="text-sm text-bone-400">Tournament title</span>
        <input
          name="title"
          required
          value={form.title}
          onChange={handleChange}
          className="mt-1 w-full bg-ash-800 border border-ash-700 px-3 py-2 text-bone-100 focus:outline-none focus:border-ember-500"
          placeholder="e.g. Friday Night Squad Clash"
        />
      </label>

      <label className="block">
        <span className="text-sm text-bone-400">Banner image URL</span>
        <input
          name="banner"
          value={form.banner}
          onChange={handleChange}
          className="mt-1 w-full bg-ash-800 border border-ash-700 px-3 py-2 text-bone-100 focus:outline-none focus:border-ember-500"
        />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="text-sm text-bone-400">Entry fee (৳)</span>
          <input
            type="number"
            name="entryFee"
            min={0}
            value={form.entryFee}
            onChange={handleChange}
            className="mt-1 w-full bg-ash-800 border border-ash-700 px-3 py-2 text-bone-100 focus:outline-none focus:border-ember-500"
          />
        </label>
        <label className="block">
          <span className="text-sm text-bone-400">Prize pool (৳)</span>
          <input
            type="number"
            name="prizePool"
            min={0}
            required
            value={form.prizePool}
            onChange={handleChange}
            className="mt-1 w-full bg-ash-800 border border-ash-700 px-3 py-2 text-bone-100 focus:outline-none focus:border-ember-500"
          />
        </label>
        <label className="block">
          <span className="text-sm text-bone-400">Total slots</span>
          <input
            type="number"
            name="totalSlots"
            min={1}
            required
            disabled={!!initial} // slot total shouldn't change after players have booked
            value={form.totalSlots}
            onChange={handleChange}
            className="mt-1 w-full bg-ash-800 border border-ash-700 px-3 py-2 text-bone-100 focus:outline-none focus:border-ember-500 disabled:opacity-50"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-bone-400">Schedule (start time)</span>
        <input
          type="datetime-local"
          name="schedule"
          required
          value={form.schedule}
          onChange={handleChange}
          className="mt-1 w-full bg-ash-800 border border-ash-700 px-3 py-2 text-bone-100 focus:outline-none focus:border-ember-500"
        />
      </label>

      <label className="block">
        <span className="text-sm text-bone-400">Rules</span>
        <textarea
          name="rules"
          rows={4}
          value={form.rules}
          onChange={handleChange}
          className="mt-1 w-full bg-ash-800 border border-ash-700 px-3 py-2 text-bone-100 text-sm focus:outline-none focus:border-ember-500"
        />
      </label>

      {error && <p className="text-sm text-ember-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-ember-500 hover:bg-ember-600 disabled:bg-ash-700 text-ash-950 font-display font-semibold py-3 transition-colors"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
