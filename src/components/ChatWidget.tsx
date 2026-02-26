"use client";

import { useEffect, useState, useRef } from "react";

interface ChatWidgetProps {
  userId: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
}

export default function ChatWidget({ userId }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !userId) return;
    fetch(`/api/chat?userId=${userId}`)
      .then((r) => r.json())
      .then((data: { session?: { messages?: Message[] } }) => {
        if (data.session?.messages) {
          setMessages(data.session.messages);
        }
      })
      .catch(() => {});
  }, [open, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, content, sender: "user" }),
      });
      const msg = await res.json() as Message;
      if (res.ok) setMessages((prev) => [...prev, msg]);
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ height: "400px" }}>
          {/* Header */}
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Support Chat</div>
              <div className="text-xs text-green-400">● Online</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-xs mt-4">
                Send a message to start the conversation.
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-3 py-1.5 rounded-lg text-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-700 p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg border border-gray-700 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={sending}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((p) => !p)}
        className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl"
      >
        💬
      </button>
    </div>
  );
}
