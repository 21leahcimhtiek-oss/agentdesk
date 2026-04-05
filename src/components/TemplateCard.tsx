import Link from "next/link";
import type { AgentTemplate } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  "customer-support": "bg-blue-950 text-blue-400 border-blue-900",
  "data-analysis": "bg-green-950 text-green-400 border-green-900",
  "content": "bg-pink-950 text-pink-400 border-pink-900",
  "coding": "bg-orange-950 text-orange-400 border-orange-900",
  "general": "bg-gray-800 text-gray-400 border-gray-700",
};

interface TemplateCardProps {
  template: AgentTemplate;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-white font-semibold text-sm">{template.name}</h3>
        <span className={`text-xs border px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${CATEGORY_COLORS[template.category] ?? CATEGORY_COLORS.general}`}>
          {template.category.replace("-", " ")}
        </span>
      </div>
      {template.description && (
        <p className="text-gray-400 text-xs leading-relaxed flex-1">{template.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="bg-gray-800 px-2 py-0.5 rounded font-mono">{template.model}</span>
        <span>temp: {template.temperature}</span>
      </div>
      <Link href={`/agents/new?template=${template.id}`}
        className="block text-center text-sm bg-aurora-600 hover:bg-aurora-700 text-white py-2.5 rounded-lg font-medium transition-colors">
        Use Template
      </Link>
    </div>
  );
}