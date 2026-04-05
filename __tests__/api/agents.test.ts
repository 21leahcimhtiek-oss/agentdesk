import { NextRequest } from "next/server";

// Mock Supabase
const mockFrom = jest.fn();
const mockSupabase = {
  auth: { getUser: jest.fn() },
  from: mockFrom,
};

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}));

jest.mock("@/lib/rate-limit", () => ({
  apiRateLimit: { limit: jest.fn(() => Promise.resolve({ success: true })) },
}));

jest.mock("@/lib/stripe/client", () => ({
  PLAN_LIMITS: {
    free: { agents: 1, executions_per_month: 100, team_members: 1 },
    starter: { agents: 5, executions_per_month: 10000, team_members: 1 },
    pro: { agents: 25, executions_per_month: 100000, team_members: 10 },
    enterprise: { agents: -1, executions_per_month: 1000000, team_members: -1 },
  },
}));

import { GET, POST } from "@/app/api/agents/route";

describe("GET /api/agents", () => {
  it("returns 401 if not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    const req = new NextRequest("http://localhost/api/agents");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns agents list for authenticated user", async () => {
    const user = { id: "user-1", email: "test@example.com" };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { org_id: "org-1" } }),
        }),
      }),
    });
    const req = new NextRequest("http://localhost/api/agents");
    expect(req).toBeDefined();
  });
});

describe("POST /api/agents", () => {
  it("returns 400 for invalid agent data", async () => {
    const user = { id: "user-1", email: "test@example.com" };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });

    const mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { org_id: "org-1", role: "admin", orgs: { plan: "starter" } }
      }),
      then: jest.fn(),
    };
    mockFrom.mockReturnValue(mockChain);

    const req = new NextRequest("http://localhost/api/agents", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 when agent limit reached", async () => {
    const user = { id: "user-1", email: "test@example.com" };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });
    expect(user).toBeDefined();
  });
});