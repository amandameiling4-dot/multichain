"use client";

import { useEffect, useRef, useState } from "react";
import WalletGate from "@/components/WalletGate";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

interface Message {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
}

export default function SupportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = localStorage.getItem("connectedWallet");
    if (!w) return;
    fetch(`/api/users?walletAddress=${w}`)
      .then((r) => r.json())
      .then((u: { id?: string }) => {
        if (u.id) {
          setUserId(u.id);
          return fetch(`/api/chat?userId=${u.id}`);
        }
        return null;
      })
      .then((r) => r ? r.json() : { session: null })
      .then((data: { session?: { messages?: Message[] } }) => {
        if (data.session?.messages) setMessages(data.session.messages);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || !userId || sending) return;
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
    <WalletGate>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-60 px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-6">Customer Support</h1>

          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col" style={{ height: "560px" }}>
              {/* Chat header */}
              <div className="bg-gray-800 px-5 py-4 flex items-center gap-3 border-b border-gray-700">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm">💬</div>
                <div>
                  <div className="text-sm font-semibold text-white">Support Team</div>
                  <div className="text-xs text-green-400">● Available 24/7</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm mt-8">
                    <div className="text-3xl mb-2">👋</div>
                    <p>Hi! How can we help you today?</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-800 text-gray-200 rounded-bl-sm"
                    }`}>
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-700 p-4 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-600"
                />
                <button
                  onClick={send}
                  disabled={sending || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </WalletGate>
  );
}
