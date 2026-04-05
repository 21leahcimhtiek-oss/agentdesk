import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock Supabase
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn(), signOut: jest.fn() },
    from: jest.fn(() => ({ select: jest.fn(), insert: jest.fn(), update: jest.fn(), delete: jest.fn() })),
  })),
}));