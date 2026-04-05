"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Zap, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", orgName: "", fullName: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.fullName, org_name: formData.orgName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }
    router.push("/dashboard");
    router.refresh();
  }

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((p) => ({ ...p, [field]: e.target.value }));

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
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 mt-1">14-day free trial, no credit card required</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5">
          {error && <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full name</label>
            <input type="text" required value={formData.fullName} onChange={update("fullName")}
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-500 transition"
              placeholder="Jane Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Organization name</label>
            <input type="text" required value={formData.orgName} onChange={update("orgName")}
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-500 transition"
              placeholder="Acme Corp" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Work email</label>
            <input type="email" required value={formData.email} onChange={update("email")}
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-500 transition"
              placeholder="you@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input type="password" required minLength={8} value={formData.password} onChange={update("password")}
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-500 transition"
              placeholder="At least 8 characters" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-aurora-600 hover:bg-aurora-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Creating account..." : "Create account"}
          </button>
          <p className="text-center text-xs text-gray-500">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-aurora-400 hover:text-aurora-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}