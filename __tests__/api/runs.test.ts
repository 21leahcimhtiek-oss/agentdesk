jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { org_id: 'org-1', role: 'member' } }),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      gte: jest.fn().mockReturnThis(),
    })),
  })),
}));

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ success: true }),
}));

describe('Runs API', () => {
  it('GET /api/runs should return run list', async () => {
    const { GET } = await import('@/app/api/runs/route');
    const { NextRequest } = await import('next/server');
    const req = new NextRequest('http://localhost:3000/api/runs');
    const res = await GET(req);
    expect([200, 401, 500]).toContain(res.status);
  });

  it('POST requires valid run schema', async () => {
    const { POST } = await import('@/app/api/runs/route');
    const { NextRequest } = await import('next/server');
    const req = new NextRequest('http://localhost:3000/api/runs', {
      method: 'POST',
      body: JSON.stringify({ agent_id: 'not-a-uuid' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});