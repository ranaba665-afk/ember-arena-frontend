// src/app/wallet/page.jsx

"use client";

import { useEffect, useState } from "react";
import { getWallet, createWalletTopUpOrder } from "@/lib/api";
import { loadRazorpayScript } from "@/hooks/useRazorpayScript";
import { getSocket } from "@/lib/socket";
import { getCurrentUser } from "@/lib/auth";

const QUICK_AMOUNTS = [50, 100, 200, 500];

export default function WalletPage() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("loading");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const load = () =>
    getWallet()
      .then((data) => {
        setBalance(data.balance);
        setTransactions(data.transactions);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));

  useEffect(() => {
    load();

    const user = getCurrentUser();
    if (!user) return;
    const socket = getSocket();
    socket.emit("joinUser", user.id);

    const handler = (payload) => {
      setBalance(payload.balance);
      load();
    };
    socket.on("walletUpdated", handler);
    return () => socket.off("walletUpdated", handler);
  }, []);

  const handleTopUp = async (value) => {
    const topUpAmount = Number(value);
    if (!topUpAmount || topUpAmount < 10) {
      setError("Minimum top-up is ৳10.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const order = await createWalletTopUpOrder(topUpAmount);
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
        description: "Add money to wallet",
        config: {
          display: {
            blocks: {
              upi: { name: "Pay via UPI", instruments: [{ method: "upi" }] },
            },
            sequence: ["block.upi"],
            preferences: { show_default_blocks: true },
          },
        },
        prefill: { name: user?.name, email: user?.email, contact: order.prefill?.contact },
        theme: { color: "#FF5A1F" },
        handler: () => {
          setSubmitting(false);
          setAmount("");
        },
        modal: { ondismiss: () => setSubmitting(false) },
      });

      rzp.on("payment.failed", () => {
        setError("Payment failed or was cancelled.");
        setSubmitting(false);
      });

      rzp.open();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-ash-950 font-body px-6 py-12">
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-3xl font-bold text-bone-100 mb-6">Wallet</h1>

        {status === "loading" && <p className="text-bone-400">Loading…</p>}
        {status === "error" && <p className="text-ember-400">Couldn't load your wallet.</p>}

        {status !== "loading" && status !== "error" && (
          <>
            <div className="bg-ash-800 border border-ash-700 p-6 mb-6">
              <p className="text-sm text-bone-400">Balance</p>
              <p className="font-display text-4xl text-ember-400">৳{balance}</p>
            </div>

            <div className="bg-ash-800 border border-ash-700 p-6 mb-6">
              <h2 className="font-display text-lg text-bone-100 mb-3">Add money</h2>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {QUICK_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(String(v))}
                    className={`py-2 text-sm font-display border ${
                      amount === String(v)
                        ? "border-ember-500 text-ember-400"
                        : "border-ash-700 text-bone-400"
                    }`}
                  >
                    ৳{v}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  min={10}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="flex-1 bg-ash-950 border border-ash-700 px-3 py-2 text-bone-100 focus:outline-none focus:border-ember-500"
                />
                <button
                  onClick={() => handleTopUp(amount)}
                  disabled={submitting}
                  className="bg-ember-500 hover:bg-ember-600 disabled:bg-ash-700 text-ash-950 font-display font-semibold px-5 py-2"
                >
                  {submitting ? "Opening…" : "Add via UPI"}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-ember-400">{error}</p>}
            </div>

            <div className="bg-ash-800 border border-ash-700 p-6">
              <h2 className="font-display text-lg text-bone-100 mb-3">History</h2>
              {transactions.length === 0 ? (
                <p className="text-sm text-bone-400">No transactions yet.</p>
              ) : (
                <div className="flex flex-col divide-y divide-ash-700">
                  {transactions.map((tx) => (
                    <div key={tx._id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm text-bone-100">
                          {tx.type === "topup" ? "Added to wallet" : "Tournament entry"}
                        </p>
                        <p className="text-xs text-bone-400">
                          {new Date(tx.createdAt).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <p
                        className={`font-display ${
                          tx.type === "topup" ? "text-gold-400" : "text-bone-100"
                        }`}
                      >
                        {tx.type === "topup" ? "+" : "-"}৳{tx.amount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
