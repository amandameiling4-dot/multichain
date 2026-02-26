"use client";

import { useEffect, useState } from "react";

interface NotificationBellProps {
  userId: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!userId) return;
    function fetchCount() {
      fetch(`/api/notifications?userId=${userId}`)
        .then((r) => r.json())
        .then((data: { isRead: boolean }[]) => {
          if (Array.isArray(data)) {
            setUnread(data.filter((n) => !n.isRead).length);
          }
        })
        .catch(() => {});
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="relative inline-flex">
      <button className="text-gray-400 hover:text-white p-1">
        🔔
      </button>
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </div>
  );
}
