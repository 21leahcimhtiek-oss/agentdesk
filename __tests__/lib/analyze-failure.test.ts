jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  root_cause: 'API timeout during tool execution',
                  category: 'timeout',
                  severity: 'high',
                  suggestions: ['Increase timeout', 'Add retry logic'],
                  similar_patterns: ['Network issues', 'Rate limiting'],
                }),
              },
            }],
          }),
        },
      },
    })),
  };
});

import { analyzeFailure } from '@/lib/openai/analyze-failure';
import type { AgentRun } from '@/types';

const mockRun: AgentRun = {
  id: 'run-1',
  agent_id: 'agent-1',
  org_id: 'org-1',
  status: 'failed',
  input: { query: 'test' },
  tool_calls: [{ name: 'search', input: { q: 'test' }, error: 'Timeout' }],
  tokens_used: 500,
  cost_usd: 0.001,
  latency_ms: 30000,
  error_message: 'Tool execution timed out',
  started_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

describe('analyzeFailure', () => {
  it('returns structured failure analysis', async () => {
    const result = await analyzeFailure(mockRun);
    expect(result).toHaveProperty('root_cause');
    expect(result).toHaveProperty('category');
    expect(result).toHaveProperty('severity');
    expect(result).toHaveProperty('suggestions');
    expect(Array.isArray(result.suggestions)).toBe(true);
  });

  it('returns valid category', async () => {
    const result = await analyzeFailure(mockRun);
    const validCategories = ['tool_error', 'timeout', 'token_limit', 'logic_error', 'external_api', 'unknown'];
    expect(validCategories).toContain(result.category);
  });
});