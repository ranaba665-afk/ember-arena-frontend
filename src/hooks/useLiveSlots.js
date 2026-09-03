// src/hooks/useLiveSlots.js
//
// Joins the tournament's socket room on mount, listens for
// slotUpdated events, and returns the live remaining/total count.
// initialSlots is used until the first event arrives (or forever,
// if nobody else books while the page is open).

"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export function useLiveSlots(tournamentId, initialSlots) {
  const [slots, setSlots] = useState(initialSlots);

  useEffect(() => {
    if (!tournamentId) return;
    const socket = getSocket();

    socket.emit("joinTournament", tournamentId);

    const handleUpdate = (payload) => {
      if (payload.tournamentId === tournamentId) {
        setSlots({ remaining: payload.remaining, total: payload.total });
      }
    };
    socket.on("slotUpdated", handleUpdate);

    return () => {
      socket.emit("leaveTournament", tournamentId);
      socket.off("slotUpdated", handleUpdate);
    };
  }, [tournamentId]);

  return slots;
}
