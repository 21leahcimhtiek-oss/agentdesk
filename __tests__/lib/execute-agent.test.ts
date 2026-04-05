import { executeAgent } from "@/lib/openai/execute-agent";

const mockCreate = jest.fn();

jest.mock("openai", () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}));

describe("executeAgent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns execution result on success", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "Hello, I am an AI!" } }],
      usage: { total_tokens: 42 },
    });

    const result = await executeAgent({
      model: "gpt-4o-mini",
      systemPrompt: "You are helpful.",
      input: "Say hello",
      temperature: 0.7,
      maxTokens: 256,
    });

    expect(result.output).toBe("Hello, I am an AI!");
    expect(result.tokens_used).toBe(42);
    expect(result.cost_usd).toBeGreaterThan(0);
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it("calculates cost correctly for gpt-4o-mini", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "Test" } }],
      usage: { total_tokens: 1000 },
    });

    const result = await executeAgent({
      model: "gpt-4o-mini",
      systemPrompt: "Test",
      input: "Test",
      temperature: 0.5,
      maxTokens: 100,
    });

    // 1000 tokens * $0.00015/1k = $0.00015
    expect(result.cost_usd).toBeCloseTo(0.00015, 5);
  });

  it("retries on failure with exponential backoff", async () => {
    jest.useFakeTimers();
    mockCreate
      .mockRejectedValueOnce(new Error("Rate limit"))
      .mockRejectedValueOnce(new Error("Rate limit"))
      .mockResolvedValue({
        choices: [{ message: { content: "Success after retry" } }],
        usage: { total_tokens: 10 },
      });

    const promise = executeAgent({
      model: "gpt-4o-mini",
      systemPrompt: "Test",
      input: "Test",
      temperature: 0.5,
      maxTokens: 100,
      maxRetries: 3,
    });

    // Advance timers for retries
    await jest.runAllTimersAsync();
    const result = await promise;
    expect(result.output).toBe("Success after retry");
    expect(mockCreate).toHaveBeenCalledTimes(3);

    jest.useRealTimers();
  });

  it("throws after maxRetries exhausted", async () => {
    mockCreate.mockRejectedValue(new Error("Persistent error"));

    await expect(
      executeAgent({
        model: "gpt-4o-mini",
        systemPrompt: "Test",
        input: "Test",
        temperature: 0.5,
        maxTokens: 100,
        maxRetries: 2,
      })
    ).rejects.toThrow("Persistent error");
  });
});