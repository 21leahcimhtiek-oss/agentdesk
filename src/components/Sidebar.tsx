"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, Zap, History, BookOpen, Plug, BarChart3, CreditCard, Settings, LogOut } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Zap },
  { href: "/executions", label: "Executions", icon: History },
  { href: "/templates", label: "Templates", icon: BookOpen },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-gray-900 border-r border-gray-800 h-screen sticky top-0">
      <div className="p-4 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-aurora-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">AgentDesk</span>
        </Link>
      </div>
      <div className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-aurora-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </div>
      <div className="p-3 border-t border-gray-800">
        <button onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 w-full transition-colors">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}