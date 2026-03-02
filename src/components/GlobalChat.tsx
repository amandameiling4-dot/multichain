"use client";

/**
 * GlobalChat — renders the ChatWidget bubble on every user-facing page.
 *
 * It reads the connected wallet from localStorage, resolves the AppUser id
 * from the API, and then mounts the ChatWidget. On server render (SSR) this
 * component is a no-op because it relies on localStorage and the userId fetch.
 */

import { useEffect, useState } from "react";
import ChatWidget from "@/components/ChatWidget";

export default function GlobalChat() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const wallet = typeof window !== "undefined"
      ? localStorage.getItem("connectedWallet")
      : null;

    if (!wallet) return;

    fetch(`/api/users?walletAddress=${wallet}`)
      .then((r) => r.json())
      .then((u: { id?: string }) => {
        if (u.id) setUserId(u.id);
      })
      .catch(() => {});
  }, []);

  if (!userId) return null;
  return <ChatWidget userId={userId} />;
}
