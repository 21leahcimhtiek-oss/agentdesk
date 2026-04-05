import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface FailureAnalysis {
  rootCause: string;
  severity: "low" | "medium" | "high" | "critical";
  suggestions: string[];
  affectedComponents: string[];
}

export async function analyzeFailure(
  errorMessage: string,
  toolCalls: unknown[],
  agentName: string
): Promise<FailureAnalysis> {
  const prompt = `You are an AI agent debugging assistant. Analyze this agent failure and provide a structured root cause analysis.

Agent: ${agentName}
Error: ${errorMessage}
Tool Calls: ${JSON.stringify(toolCalls, null, 2)}

Respond with JSON matching this schema:
{
  "rootCause": "string - concise explanation of what went wrong",
  "severity": "low|medium|high|critical",
  "suggestions": ["array of actionable fixes"],
  "affectedComponents": ["array of system components involved"]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return result as FailureAnalysis;
}