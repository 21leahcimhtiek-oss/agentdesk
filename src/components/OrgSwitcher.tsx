"use client";
import { useState } from "react";
import { ChevronDown, Building2 } from "lucide-react";
import type { Org } from "@/types";

const PLAN_COLORS = {
  free: "bg-gray-700 text-gray-300",
  starter: "bg-blue-950 text-blue-400",
  pro: "bg-aurora-950 text-aurora-400",
  enterprise: "bg-amber-950 text-amber-400",
};

interface OrgSwitcherProps {
  currentOrg: Org;
  orgs: Org[];
}

export default function OrgSwitcher({ currentOrg, orgs }: OrgSwitcherProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 w-full">
        <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-white text-sm font-medium truncate flex-1 text-left">{currentOrg.name}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${PLAN_COLORS[currentOrg.plan]}`}>{currentOrg.plan}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
      {open && orgs.length > 1 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {orgs.map((org) => (
            <button key={org.id} className="flex items-center gap-2 px-3 py-2.5 w-full hover:bg-gray-700 transition-colors text-left">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-white text-sm">{org.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}