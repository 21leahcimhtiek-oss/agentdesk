import Link from 'next/link';
import { Activity, BarChart3, Bell, DollarSign, Shield, Zap } from 'lucide-react';

const features = [
  { icon: Activity, title: 'Run Trace Viewer', desc: 'Full trace of every agent run: tool calls, latency, tokens used.' },
  { icon: DollarSign, title: 'Cost Tracking', desc: 'Per-agent cost dashboards with budget limits and alerts.' },
  { icon: Bell, title: 'Failure Alerts', desc: 'GPT-4o powered root cause analysis with Slack/email webhooks.' },
  { icon: BarChart3, title: 'Usage Analytics', desc: 'Trends, anomaly detection, and capacity planning.' },
  { icon: Shield, title: 'Multi-Tenant', desc: 'Organizations, roles, and API key management built in.' },
  { icon: Zap, title: 'Agent Registry', desc: 'Register and configure all your deployed AI agents in one place.' },
];

const plans = [
  { name: 'Starter', price: 49, runs: '10,000', agents: '5', retention: '30 days', highlight: false },
  { name: 'Pro', price: 149, runs: '100,000', agents: '25', retention: '90 days', highlight: true },
  { name: 'Enterprise', price: 499, runs: 'Unlimited', agents: 'Unlimited', retention: '1 year', highlight: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-brand-600" />
          <span className="font-bold text-xl text-gray-900">AgentDesk</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Sign in</Link>
          <Link href="/signup" className="btn-primary text-sm">Get started</Link>
        </div>
      </nav>

      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <Zap className="h-3.5 w-3.5" />
          AI Agent Observability Platform
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Full visibility into your<br />AI agents in production
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          AgentDesk gives engineering teams complete observability into agent runs, tool calls, costs, and failures — across all deployed AI agents.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="btn-primary text-base px-8 py-3">Start free trial</Link>
          <Link href="#features" className="btn-secondary text-base px-8 py-3">See features</Link>
        </div>
      </section>

      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything your team needs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="card p-6">
                <f.icon className="h-8 w-8 text-brand-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Simple, predictable pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.name} className={`card p-8 ${plan.highlight ? 'ring-2 ring-brand-500' : ''}`}>
                {plan.highlight && (
                  <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">Most popular</div>
                )}
                <div className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</div>
                <div className="text-4xl font-bold text-gray-900 mb-6">
                  ${plan.price}<span className="text-lg font-normal text-gray-500">/mo</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-gray-600">
                  <li>{plan.runs} runs/month</li>
                  <li>{plan.agents} agents</li>
                  <li>{plan.retention} data retention</li>
                </ul>
                <Link href="/signup" className={plan.highlight ? 'btn-primary w-full text-center block' : 'btn-secondary w-full text-center block'}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-12 px-6 text-center text-gray-500 text-sm">
        <p>© 2024 AgentDesk. Built for engineering teams shipping AI.</p>
      </footer>
    </div>
  );
}