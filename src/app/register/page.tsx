"use client";

import Link from "next/link";
import RegistrationFlow from "@/components/RegistrationFlow";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="mb-6 text-center">
        <span className="text-2xl font-bold text-white">⛓️ MultiChain</span>
      </div>
      <RegistrationFlow onComplete={() => {}} />
      <p className="mt-4 text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/" className="text-blue-400 hover:underline">
          Go to Dashboard
        </Link>
      </p>
    </div>
  );
}
