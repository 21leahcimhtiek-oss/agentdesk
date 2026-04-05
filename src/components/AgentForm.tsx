"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const AgentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  model: z.enum(["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"]),
  system_prompt: z.string().max(8000),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().int().min(1).max(32000),
});

type AgentFormData = z.infer<typeof AgentSchema>;

interface AgentFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<AgentFormData>;
  agentId?: string;
}

export default function AgentForm({ mode, defaultValues, agentId }: AgentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<AgentFormData>({
    resolver: zodResolver(AgentSchema),
    defaultValues: {
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 1024,
      system_prompt: "",
      ...defaultValues,
    },
  });

  const temperature = watch("temperature");

  async function onSubmit(data: AgentFormData) {
    setError(null);
    const url = mode === "create" ? "/api/agents" : `/api/agents/${agentId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Something went wrong"); return; }
    router.push(`/agents/${json.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
      {error && <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Name <span className="text-red-400">*</span></label>
        <input {...register("name")} className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-500 transition" placeholder="My Agent" />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <input {...register("description")} className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-500 transition" placeholder="What does this agent do?" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
        <select {...register("model")} className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-500 transition">
          <option value="gpt-4o-mini">GPT-4o-mini (fast, cheap)</option>
          <option value="gpt-4o">GPT-4o (most capable)</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo (legacy)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">System Prompt</label>
        <textarea {...register("system_prompt")} rows={6}
          className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-500 transition font-mono text-sm resize-none"
          placeholder="You are a helpful assistant..." />
        {errors.system_prompt && <p className="text-red-400 text-xs mt-1">{errors.system_prompt.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Temperature: <span className="text-aurora-400 font-mono">{temperature}</span>
        </label>
        <input {...register("temperature", { valueAsNumber: true })} type="range" min="0" max="2" step="0.1"
          className="w-full accent-aurora-600" />
        <div className="flex justify-between text-xs text-gray-500 mt-1"><span>Precise (0)</span><span>Creative (2)</span></div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Max Tokens</label>
        <input {...register("max_tokens", { valueAsNumber: true })} type="number" min="1" max="32000"
          className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-500 transition" />
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full bg-aurora-600 hover:bg-aurora-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? "Saving..." : mode === "create" ? "Create agent" : "Save changes"}
      </button>
    </form>
  );
}