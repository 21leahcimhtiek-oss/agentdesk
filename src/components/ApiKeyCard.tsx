"use client";
import { useState } from "react";
import type { ApiKey } from "@/types";
import { Copy, Check, Trash2 } from "lucide-react";

interface ApiKeyCardProps {
  apiKey: ApiKey;
}

export default function ApiKeyCard({ apiKey }: ApiKeyCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(apiKey.key_prefix + "...");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRevoke() {
    if (!confirm(`Revoke API key "${apiKey.name}"? This cannot be undone.`)) return;
    await fetch(`/api/api-keys?id=${apiKey.id}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm">{apiKey.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <code className="text-gray-400 text-xs font-mono bg-gray-800 px-2 py-0.5 rounded">
            {apiKey.key_prefix}••••••••••••••••••••••••
          </code>
        </div>
        <p className="text-gray-500 text-xs mt-1">
          Created {new Date(apiKey.created_at).toLocaleDateString()}
          {apiKey.last_used_at && ` · Last used ${new Date(apiKey.last_used_at).toLocaleDateString()}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors" title="Copy prefix">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
        <button onClick={handleRevoke} className="p-2 rounded-lg hover:bg-red-950 text-gray-400 hover:text-red-400 transition-colors" title="Revoke key">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}