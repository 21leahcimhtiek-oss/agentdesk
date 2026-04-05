"use client";
import { useEffect, useState } from "react";
import { BudgetMeter } from "@/components/BudgetMeter";
import { formatCost } from "@/lib/utils";

interface Budget {
  id: string;
  agent_id: string | null;
  monthly_limit_usd: number;
  alert_threshold: number;
  current_spend_usd: number;
  agents?: { name: string } | null;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [limit, setLimit] = useState("100");
  const [threshold, setThreshold] = useState("0.8");

  useEffect(() => {
    fetch("/api/budgets").then((r) => r.json()).then((d) => { setBudgets(d.budgets || []); setLoading(false); });
  }, []);

  const createBudget = async () => {
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthly_limit_usd: parseFloat(limit), alert_threshold: parseFloat(threshold) }),
    });
    setShowForm(false);
    fetch("/api/budgets").then((r) => r.json()).then((d) => setBudgets(d.budgets || []));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-500 text-sm mt-1">Manage spending limits and alerts</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          + New Budget
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Create Budget</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Monthly Limit (USD)</label>
              <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Alert Threshold (0-1)</label>
              <input type="number" step="0.05" value={threshold} onChange={(e) => setThreshold(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={createBudget} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Create</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-400 text-center py-8">Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400">No budgets configured</p>
          </div>
        ) : budgets.map((b) => (
          <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-gray-900">{b.agents?.name ?? "Organization Budget"}</p>
                <p className="text-sm text-gray-500">Limit: {formatCost(b.monthly_limit_usd)} / month</p>
              </div>
              <p className="text-sm font-medium text-gray-700">{formatCost(b.current_spend_usd)} spent</p>
            </div>
            <BudgetMeter current={b.current_spend_usd} limit={b.monthly_limit_usd} threshold={b.alert_threshold} />
          </div>
        ))}
      </div>
    </div>
  );
}