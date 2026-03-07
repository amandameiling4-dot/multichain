"use client";

/**
 * GlobalChat — renders the ChatWidget bubble on every user-facing page.
 *
 * It fetches the current user from the session cookie and mounts the
 * ChatWidget when a valid session is found.
 */

import { useEffect, useState } from "react";
import ChatWidget from "@/components/ChatWidget";

export default function GlobalChat() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((u: { id?: string }) => {
        if (u.id) setUserId(u.id);
      })
      .catch(() => {});
  }, []);

  if (!userId) return null;
  return <ChatWidget userId={userId} />;
}
