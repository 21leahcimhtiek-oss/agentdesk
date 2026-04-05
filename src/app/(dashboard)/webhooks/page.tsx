"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["run.failed"]);

  const EVENT_OPTIONS = ["run.failed", "run.success", "budget.alert", "budget.exceeded", "anomaly.detected"];

  useEffect(() => {
    fetch("/api/webhooks").then((r) => r.json()).then((d) => { setWebhooks(d.webhooks || []); setLoading(false); });
  }, []);

  const createWebhook = async () => {
    await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, events }),
    });
    setShowForm(false);
    setUrl("");
    fetch("/api/webhooks").then((r) => r.json()).then((d) => setWebhooks(d.webhooks || []));
  };

  const toggleEvent = (event: string) => {
    setEvents((prev) => prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-gray-500 text-sm mt-1">Receive alerts via HTTP webhooks</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          + Add Webhook
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">New Webhook</h2>
          <div>
            <label className="text-sm text-gray-600">Endpoint URL</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..."
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-2">Events</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_OPTIONS.map((event) => (
                <button key={event} onClick={() => toggleEvent(event)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${events.includes(event) ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                  {event}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={createWebhook} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Create</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="text-gray-400 text-center py-8">Loading webhooks...</p>
        ) : webhooks.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No webhooks configured</p>
        ) : webhooks.map((wh) => (
          <div key={wh.id} className="p-4 border-b border-gray-100 last:border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 font-mono">{wh.url}</p>
                <div className="flex gap-1 mt-1">
                  {wh.events.map((e) => (
                    <span key={e} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{e}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${wh.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {wh.active ? "Active" : "Inactive"}
                </span>
                <span className="text-xs text-gray-400">{formatDate(wh.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}