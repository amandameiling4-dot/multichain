"use client";

import { useState } from "react";

interface RegistrationFlowProps {
  onComplete?: (userId: string, email: string) => void;
}

export default function RegistrationFlow({ onComplete }: RegistrationFlowProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [userId] = useState(() => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return String(10000 + (arr[0] % 90000));
  });

  function handleEmailSubmit() {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setStep(2);
  }

  function handleCodeVerify() {
    // Demo-only: hardcoded verification code for simulation purposes
    if (code !== "123456") {
      setError("Invalid verification code. Use: 123456 (demo)");
      return;
    }
    setError("");
    localStorage.setItem("registeredUserId", userId);
    localStorage.setItem("registeredEmail", email);
    setStep(3);
    onComplete?.(userId, email);
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-sm w-full">
      {step === 1 && (
        <>
          <h2 className="text-xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your email to get started.</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm mb-3"
          />
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <button
            onClick={handleEmailSubmit}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg"
          >
            Continue
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-xl font-bold text-white mb-2">Verify Email</h2>
          <p className="text-gray-400 text-sm mb-1">Code sent to: <span className="text-white">{email}</span></p>
          <p className="text-xs text-gray-500 mb-4">(Demo: use code <span className="text-yellow-400 font-mono">123456</span>)</p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm mb-3 font-mono tracking-widest"
          />
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <button
            onClick={handleCodeVerify}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg"
          >
            Verify
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <div className="text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-white mb-2">Registration Complete!</h2>
            <p className="text-gray-400 text-sm mb-4">
              Welcome to MultiChain. Your user ID is:
            </p>
            <div className="bg-gray-800 rounded-lg px-4 py-2 text-white font-mono text-lg mb-4">
              #{userId}
            </div>
            <p className="text-xs text-gray-500">You can now start trading.</p>
          </div>
        </>
      )}
    </div>
  );
}
