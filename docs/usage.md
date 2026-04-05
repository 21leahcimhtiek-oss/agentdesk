# AgentDesk Usage Guide

## Registering an Agent

1. Go to **Agents** in the sidebar
2. Click **Register Agent**
3. Enter name, description, and optional endpoint URL
4. Copy the agent ID for use in your SDK calls

## Ingesting Run Data

Call the runs API from your agent code:

```javascript
await fetch('https://your-agentdesk.com/api/runs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    agent_id: 'your-agent-uuid',
    status: 'success',
    input: { user_query: 'Hello' },
    output: { response: 'Hi there!' },
    tool_calls: [
      { name: 'search', input: { q: 'Hello' }, output: { results: [] }, latency_ms: 200 }
    ],
    tokens_used: 850,
    cost_usd: 0.00127,
    latency_ms: 1240,
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString()
  })
});
```

## Setting Up Budget Alerts

1. Go to **Budgets**
2. Set a monthly limit in USD
3. Set an alert threshold (e.g., 0.8 = 80%)
4. Configure a webhook to receive alerts

## Configuring Webhooks

1. Go to **Webhooks**
2. Enter your endpoint URL (Slack webhook, custom endpoint, etc.)
3. Select events to subscribe to
4. Optionally set a signing secret for verification

## Analyzing Failed Runs

1. Go to **Runs** and filter by status = failed
2. Click on a failed run
3. Click **Analyze with GPT-4o**
4. Review root cause, severity, and suggested fixes