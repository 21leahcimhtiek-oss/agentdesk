'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Org {
  id: string;
  name: string;
  plan: string;
}

interface Props {
  orgs: Org[];
  currentOrgId: string;
}

export default function OrgSwitcher({ orgs, currentOrgId }: Props) {
  const [open, setOpen] = useState(false);
  const current = orgs.find(o => o.id === currentOrgId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm w-full"
      >
        <span className="font-medium text-gray-900 truncate flex-1 text-left">{current?.name}</span>
        <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {orgs.map(org => (
            <button
              key={org.id}
              onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900">{org.name}</div>
              <div className="text-xs text-gray-500 capitalize">{org.plan}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}