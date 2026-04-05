import Link from "next/link";
import { Zap, Shield, BarChart3, Users, Webhook, Key, CheckCircle, ArrowRight, Star } from "lucide-react";

const features = [
  { icon: Zap, title: "Instant Agent Deployment", description: "Configure and deploy AI agents in minutes. Choose from GPT-4o, GPT-4o-mini, and more." },
  { icon: BarChart3, title: "Real-Time Monitoring", description: "Live execution logs, token tracking, cost analytics, and success rates in one dashboard." },
  { icon: Users, title: "Team Collaboration", description: "Role-based access: Owner, Admin, Member, Viewer. Invite your entire team safely." },
  { icon: Webhook, title: "Webhook Integrations", description: "Trigger downstream systems on every execution with signed payloads and retry logic." },
  { icon: Key, title: "API Key Management", description: "Generate scoped API keys for programmatic access. SHA-256 hashed, never plaintext." },
  { icon: Shield, title: "Enterprise Security", description: "Row-level security, audit logs, SSO on Enterprise, and Sentry error tracking." },
];

const plans = [
  { name: "Starter", price: 149, highlighted: false, cta: "Start Free Trial",
    features: ["5 agents","10,000 executions/mo","API access","Email support","Basic analytics"] },
  { name: "Pro", price: 399, highlighted: true, cta: "Start Free Trial",
    features: ["25 agents","100,000 executions/mo","Webhooks","Priority support","Advanced analytics","10 team members"] },
  { name: "Enterprise", price: 899, highlighted: false, cta: "Contact Sales",
    features: ["Unlimited agents","1M executions/mo","SSO / SAML","99.9% SLA","Dedicated support","Audit logs"] },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 sticky top-0 z-50 bg-gray-950/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-aurora-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">AgentDesk</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign in</Link>
            <Link href="/signup" className="text-sm bg-aurora-600 hover:bg-aurora-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">Get started</Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-900/40 via-gray-950 to-gray-950" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-aurora-950 border border-aurora-800 text-aurora-300 text-sm px-4 py-2 rounded-full mb-8">
            <Star className="w-4 h-4" /><span>Zero-touch AI agent orchestration</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
            Run your AI agents<br /><span className="gradient-text">on autopilot</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Deploy, monitor, and scale AI agents without touching infrastructure. Full observability, team collaboration, and enterprise security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-aurora-600 hover:bg-aurora-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#pricing" className="inline-flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
              View pricing
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">No credit card required · 14-day free trial</p>
        </div>
      </section>

      <section id="features" className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Everything you need to run agents at scale</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-aurora-700 transition-colors">
                <div className="w-12 h-12 bg-aurora-950 rounded-xl flex items-center justify-center mb-4 border border-aurora-800">
                  <f.icon className="w-6 h-6 text-aurora-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Simple, predictable pricing</h2>
          <p className="text-gray-400 text-lg text-center mb-16">Scale as your AI usage grows. Annual plans save 17%.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-8 border ${plan.highlighted ? "bg-aurora-900/30 border-aurora-500" : "bg-gray-800/50 border-gray-700"}`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-aurora-600 text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
                )}
                <h3 className="text-xl font-bold mb-6">{plan.name}</h3>
                <div className="mb-8"><span className="text-5xl font-bold">${plan.price}</span><span className="text-gray-400">/mo</span></div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-aurora-400 flex-shrink-0" />{feat}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block text-center py-3 px-6 rounded-xl font-semibold transition-colors ${plan.highlighted ? "bg-aurora-600 hover:bg-aurora-700 text-white" : "border border-gray-600 hover:border-gray-400 text-gray-300"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <span>AgentDesk by Aurora Rayes LLC</span>
          <div className="flex gap-6">
            <a href="mailto:support@agentdesk.app" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}