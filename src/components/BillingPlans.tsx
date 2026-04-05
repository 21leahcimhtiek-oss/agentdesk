"use client";
import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import type { BillingPlan } from "@/types";

const PLANS = [
  { id: "starter" as BillingPlan, name: "Starter", price: 149, features: ["5 agents", "10k executions/mo", "API access", "Email support"] },
  { id: "pro" as BillingPlan, name: "Pro", price: 399, popular: true, features: ["25 agents", "100k executions/mo", "Webhooks", "Priority support", "Analytics", "10 members"] },
  { id: "enterprise" as BillingPlan, name: "Enterprise", price: 899, features: ["Unlimited agents", "1M executions/mo", "SSO", "99.9% SLA", "Dedicated support"] },
];

interface BillingPlansProps {
  currentPlan: string;
}

export default function BillingPlans({ currentPlan }: BillingPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(planId: string) {
    setLoading(planId);
    const res = await fetch("/api/billing/create-checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(null);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div key={plan.id} className={`relative rounded-2xl p-5 border ${plan.popular ? "border-aurora-600 bg-aurora-950/20" : "border-gray-700 bg-gray-900"}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-aurora-600 text-white text-xs px-3 py-0.5 rounded-full">Most Popular</div>}
              <h3 className="font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-2xl font-bold text-white mb-4">${plan.price}<span className="text-sm font-normal text-gray-400">/mo</span></p>
              <ul className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                    <CheckCircle className="w-3.5 h-3.5 text-aurora-400 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => !isCurrent && handleUpgrade(plan.id)}
                disabled={isCurrent || loading === plan.id}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                  isCurrent ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-aurora-600 hover:bg-aurora-700 text-white"
                }`}>
                {loading === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                {isCurrent ? "Current plan" : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}