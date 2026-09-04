// src/app/tournaments/[id]/page.jsx
//
// Shows full tournament info and a booking form. Submitting calls
// the atomic bookSlot endpoint; a 409 response (slots full / already
// booked) is shown inline instead of a generic error.

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTournamentById, createBookingOrder, bookWithWallet, getWallet } from "@/lib/api";
import { useLiveSlots } from "@/hooks/useLiveSlots";
import { loadRazorpayScript } from "@/hooks/useRazorpayScript";
import { getSocket } from "@/lib/socket";
import { getCurrentUser } from "@/lib/auth";

export default function TournamentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [tournament, setTournament] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [playerIGNs, setPlayerIGNs] = useState(["", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false); // waiting on webhook after UPI payment
  const [error, setError] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletSubmitting, setWalletSubmitting] = useState(false);

  useEffect(() => {
    getTournamentById(id).then(setTournament).catch(() => setTournament(null));
    getWallet().then((w) => setWalletBalance(w.balance)).catch(() => {});
  }, [id]);

  // Live slot count — updates in real time as other players book,
  // without needing to refetch the whole tournament.
  const liveSlots = useLiveSlots(id, tournament?.slots);

  const handleIGNChange = (index, value) => {
    setPlayerIGNs((prev) => prev.map((v, i) => (i === index ? value : v)));
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // This atomically reserves the slot on the backend. For a free
      // tournament it comes back already confirmed. For a paid one it
      // comes back with a Razorpay order — the slot is HELD (not yet
      // final) until the webhook confirms payment.
      const result = await createBookingOrder(id, {
        teamName,
        playerIGNs: playerIGNs.filter(Boolean),
      });

      if (result.free) {
        router.push("/dashboard");
        return;
      }

      await openRazorpayCheckout(result);
    } catch (err) {
      setError(err.message); // e.g. "Sorry, all slots are full."
      setSubmitting(false);
    }
  };

  const handleBookWithWallet = async () => {
    setWalletSubmitting(true);
    setError(null);
    try {
      // Unlike the UPI flow, this debits the wallet and confirms the
      // booking in one atomic step on the backend — no payment
      // gateway round-trip, so it's immediate.
      await bookWithWallet(id, {
        teamName,
        playerIGNs: playerIGNs.filter(Boolean),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message); // e.g. "Insufficient wallet balance."
      setWalletSubmitting(false);
    }
  };

  const openRazorpayCheckout = async (order) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Couldn't load the payment window. Check your connection and try again.");
      setSubmitting(false);
      return;
    }

    const user = getCurrentUser();

    const rzp = new window.Razorpay({
      key: order.razorpayKeyId,
      amount: order.order.amount,
      currency: order.order.currency,
      order_id: order.order.id,
      name: "Ember Arena",
      description: tournament.title,
      // Puts UPI first in the payment method list — GPay, PhonePe,
      // Paytm, and "any UPI app / QR" all appear under this block
      // before cards/netbanking.
      config: {
        display: {
          blocks: {
            upi: {
              name: "Pay via UPI",
              instruments: [{ method: "upi" }],
            },
          },
          sequence: ["block.upi"],
          preferences: { show_default_blocks: true },
        },
      },
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: order.prefill?.contact,
      },
      theme: { color: "#FF5A1F" }, // ember-500
      handler: () => {
        // IMPORTANT: this fires client-side and can be spoofed, so it
        // does NOT mark the booking paid. It only tells the UI to wait
        // for the server-confirmed "paymentConfirmed" socket event
        // (see below), which is driven by the Razorpay webhook.
        setConfirming(true);
      },
      modal: {
        ondismiss: () => setSubmitting(false),
      },
    });

    rzp.on("payment.failed", () => {
      setError("Payment failed or was cancelled. Your slot has been released.");
      setSubmitting(false);
    });

    rzp.open();
  };

  // Once the webhook confirms payment, the backend emits this event —
  // redirect to the dashboard where the booking now shows as paid.
  useEffect(() => {
    if (!confirming) return;
    const socket = getSocket();
    const handler = () => router.push("/dashboard");
    socket.on("paymentConfirmed", handler);
    return () => socket.off("paymentConfirmed", handler);
  }, [confirming, router]);

  if (!tournament) {
    return (
      <main className="min-h-screen bg-ash-950 flex items-center justify-center">
        <p className="font-body text-bone-400">Loading tournament…</p>
      </main>
    );
  }

  const slots = liveSlots || tournament.slots;
  const isFull = slots.remaining === 0;

  return (
    <main className="min-h-screen bg-ash-950 font-body px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <p className="font-body text-sm text-gold-400">{tournament.gameName}</p>
        <h1 className="font-display text-4xl font-bold text-bone-100 mt-1">
          {tournament.title}
        </h1>

        <div className="mt-6 grid grid-cols-3 gap-4 border-y border-ash-700 py-4">
          <div>
            <p className="text-xs text-bone-400">Prize pool</p>
            <p className="font-display text-xl text-ember-400">
              ৳{tournament.prizePool.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-bone-400">Entry fee</p>
            <p className="font-display text-xl text-bone-100">
              {tournament.entryFee === 0 ? "Free" : `৳${tournament.entryFee}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-bone-400">Slots</p>
            <p className="font-display text-xl text-bone-100">
              {slots.remaining}/{slots.total}
            </p>
          </div>
        </div>

        {tournament.rules && (
          <div className="mt-6">
            <h2 className="font-display text-lg text-bone-100 mb-2">Rules</h2>
            <p className="text-sm text-bone-400 whitespace-pre-line">{tournament.rules}</p>
          </div>
        )}

        {/* Booking form */}
        <form onSubmit={handleBook} className="mt-8 bg-ash-800 border border-ash-700 p-6">
          <h2 className="font-display text-lg text-bone-100 mb-4">Book your slot</h2>

          <label className="block mb-4">
            <span className="text-sm text-bone-400">Team name</span>
            <input
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="mt-1 w-full bg-ash-950 border border-ash-700 px-3 py-2 text-bone-100 focus:outline-none focus:border-ember-500"
              placeholder="e.g. Ember Wolves"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {playerIGNs.map((val, i) => (
              <input
                key={i}
                value={val}
                onChange={(e) => handleIGNChange(i, e.target.value)}
                placeholder={`Player ${i + 1} IGN`}
                className="bg-ash-950 border border-ash-700 px-3 py-2 text-bone-100 text-sm focus:outline-none focus:border-ember-500"
              />
            ))}
          </div>

          {error && <p className="mb-4 text-sm text-ember-400">{error}</p>}

          <button
            type="submit"
            disabled={isFull || submitting || confirming || walletSubmitting}
            className="w-full bg-ember-500 hover:bg-ember-600 disabled:bg-ash-700 disabled:text-bone-400 text-ash-950 font-display font-semibold py-3 transition-colors"
          >
            {isFull
              ? "Slots full"
              : confirming
              ? "Confirming payment…"
              : submitting
              ? "Opening payment…"
              : tournament.entryFee === 0
              ? "Confirm booking"
              : `Pay ৳${tournament.entryFee} via UPI`}
          </button>

          {tournament.entryFee > 0 && !isFull && (
            <button
              type="button"
              onClick={handleBookWithWallet}
              disabled={submitting || confirming || walletSubmitting || walletBalance < tournament.entryFee}
              className="mt-3 w-full border border-ash-700 hover:border-ember-500 disabled:opacity-40 text-bone-100 font-display py-3 transition-colors"
            >
              {walletSubmitting
                ? "Booking…"
                : walletBalance === null
                ? "Pay from wallet"
                : `Pay from wallet (৳${walletBalance} available)`}
            </button>
          )}
        </form>
      </div>
    </main>
  );
}
