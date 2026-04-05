'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { slugify } from '@/lib/utils';

export default function NewAgentPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug: slugify(name), description, endpoint_url: endpointUrl }),
    });
    if (res.ok) {
      const agent = await res.json();
      router.push(`/agents/${agent.id}`);
    } else {
      const err = await res.json();
      setError(err.error ?? 'Failed to create agent');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/agents" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Register New Agent</h1>
      </div>
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Agent Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input" placeholder="My Customer Support Agent" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="input resize-none" rows={3} placeholder="What does this agent do?" />
          </div>
          <div>
            <label className="label">Endpoint URL</label>
            <input type="url" value={endpointUrl} onChange={e => setEndpointUrl(e.target.value)} className="input" placeholder="https://your-agent.example.com/run" />
          </div>
          {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Registering...' : 'Register Agent'}
            </button>
            <Link href="/agents" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}