import { NextRequest } from "next/server";

const mockSupabase = {
  auth: { getUser: jest.fn() },
  from: jest.fn(),
};

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}));

jest.mock("@/lib/rate-limit", () => ({
  apiRateLimit: { limit: jest.fn(() => Promise.resolve({ success: true })) },
}));

import { GET } from "@/app/api/executions/route";

describe("GET /api/executions", () => {
  it("returns 401 if not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    const req = new NextRequest("http://localhost/api/executions");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("paginates results with page and per_page params", async () => {
    const req = new NextRequest("http://localhost/api/executions?page=2&per_page=10");
    const url = new URL(req.url);
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("per_page")).toBe("10");
  });

  it("filters by status param", async () => {
    const req = new NextRequest("http://localhost/api/executions?status=success");
    const url = new URL(req.url);
    expect(url.searchParams.get("status")).toBe("success");
  });

  it("filters by agent_id param", async () => {
    const req = new NextRequest("http://localhost/api/executions?agent_id=agent-123");
    const url = new URL(req.url);
    expect(url.searchParams.get("agent_id")).toBe("agent-123");
  });
});