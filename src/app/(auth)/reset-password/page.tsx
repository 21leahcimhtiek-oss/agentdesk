"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Zap, Loader2, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/confirm?next=/settings`,
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-aurora-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AgentDesk</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Reset your password</h1>
          <p className="text-gray-400 mt-1">Enter your email and we&apos;ll send a reset link</p>
        </div>
        {sent ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-white font-semibold text-lg mb-2">Check your email</h2>
            <p className="text-gray-400 text-sm">We sent a reset link to <strong>{email}</strong></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5">
            {error && <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-500 transition"
                placeholder="you@company.com" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-aurora-600 hover:bg-aurora-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
        <p className="text-center text-sm text-gray-400 mt-6">
          <Link href="/login" className="text-aurora-400 hover:text-aurora-300">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}