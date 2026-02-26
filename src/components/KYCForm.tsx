"use client";

import { useState } from "react";

interface KYCFormProps {
  userId: string;
  onSuccess?: () => void;
}

export default function KYCForm({ userId, onSuccess }: KYCFormProps) {
  const [form, setForm] = useState({
    fullName: "",
    docType: "passport",
    docNumber: "",
    frontImage: "",
    backImage: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function update(key: string, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function submit() {
    if (!form.fullName || !form.docNumber || !form.frontImage || !form.backImage) {
      setMessage("All fields are required.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...form }),
      });
      if (res.ok) {
        setMessage("KYC submitted successfully! We will review within 24 hours.");
        onSuccess?.();
      } else {
        setMessage("Submission failed. Please try again.");
      }
    } catch {
      setMessage("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-lg">
      <h2 className="text-lg font-semibold text-white mb-4">Identity Verification (KYC)</h2>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Full Name</label>
          <input
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            placeholder="As on document"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Document Type</label>
          <select
            value={form.docType}
            onChange={(e) => update("docType", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="passport">Passport</option>
            <option value="national_id">National ID</option>
            <option value="drivers_license">Driver&apos;s License</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Document Number</label>
          <input
            value={form.docNumber}
            onChange={(e) => update("docNumber", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            placeholder="Document number"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Front Image URL</label>
          <input
            value={form.frontImage}
            onChange={(e) => update("frontImage", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Back Image URL</label>
          <input
            value={form.backImage}
            onChange={(e) => update("backImage", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </div>

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg"
        >
          {submitting ? "Submitting..." : "Submit KYC"}
        </button>

        {message && (
          <p className="text-sm text-gray-400 text-center">{message}</p>
        )}
      </div>
    </div>
  );
}
