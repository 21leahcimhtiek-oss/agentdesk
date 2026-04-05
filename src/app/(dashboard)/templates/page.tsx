import { createClient } from "@/lib/supabase/server";
import TemplateCard from "@/components/TemplateCard";

export const metadata = { title: "Templates" };

const CATEGORIES = ["all", "customer-support", "data-analysis", "content", "coding", "general"];

export default async function TemplatesPage({ searchParams }: { searchParams: { category?: string } }) {
  const supabase = await createClient();
  const category = searchParams.category ?? "all";

  let query = supabase.from("agent_templates").select("*").eq("is_public", true).order("name");
  if (category !== "all") query = query.eq("category", category);
  const { data: templates } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Template Library</h1>
        <p className="text-gray-400 text-sm mt-1">Start from a pre-built agent template</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <a key={cat} href={`?category=${cat}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              category === cat ? "bg-aurora-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}>{cat.replace("-", " ")}</a>
        ))}
      </div>

      {templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {templates.map((t: any) => <TemplateCard key={t.id} template={t} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">No templates found for this category.</div>
      )}
    </div>
  );
}