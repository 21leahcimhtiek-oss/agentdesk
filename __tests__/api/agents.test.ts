import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { org_id: 'org-1', role: 'admin' } }),
      order: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
    })),
  })),
}));

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ success: true }),
}));

describe('Agents API', () => {
  it('should be importable', async () => {
    const mod = await import('@/app/api/agents/route');
    expect(mod.GET).toBeDefined();
    expect(mod.POST).toBeDefined();
  });

  it('GET returns unauthorized for unauthenticated user', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    (createClient as jest.Mock).mockReturnValueOnce({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      from: jest.fn(),
    });
    const { GET } = await import('@/app/api/agents/route');
    const req = new NextRequest('http://localhost:3000/api/agents');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});