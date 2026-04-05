'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <Activity className="h-6 w-6 text-brand-600" />
          <span className="font-bold text-xl text-gray-900">AgentDesk</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-600 text-sm mb-6">Sign in to your account</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required autoComplete="email" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" required autoComplete="current-password" />
          </div>
          {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="mt-6 space-y-2 text-sm text-center">
          <p className="text-gray-600">
            No account? <Link href="/signup" className="text-brand-600 hover:underline font-medium">Sign up free</Link>
          </p>
          <p>
            <Link href="/reset-password" className="text-gray-500 hover:text-gray-700">Forgot password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}