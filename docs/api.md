# AgentDesk API Reference

Base URL: `https://your-domain.com/api`

All endpoints require authentication via Supabase JWT (cookie-based for browser, Bearer token for API clients).

## Agents

### List Agents
`GET /api/agents`

Returns all agents in the authenticated user's organization.

**Response**
```json
[
  {
    "id": "uuid",
    "name": "My Agent",
    "slug": "my-agent",
    "description": "...",
    "endpoint_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Create Agent
`POST /api/agents`

**Body**
```json
{
  "name": "My Agent",
  "slug": "my-agent",
  "description": "Optional description",
  "endpoint_url": "https://your-agent.example.com/run"
}
```

### Get Agent
`GET /api/agents/:id`

### Update Agent
`PUT /api/agents/:id`

### Delete Agent
`DELETE /api/agents/:id`

---

## Runs

### List Runs
`GET /api/runs?agent_id=uuid&status=failed&limit=50`

### Create Run
`POST /api/runs`

**Body**
```json
{
  "agent_id": "uuid",
  "status": "success",
  "input": {},
  "output": {},
  "tool_calls": [
    {
      "name": "search",
      "input": {"q": "test"},
      "output": {"results": []},
      "latency_ms": 320
    }
  ],
  "tokens_used": 1500,
  "cost_usd": 0.0023,
  "latency_ms": 2300,
  "started_at": "2024-01-01T10:00:00Z",
  "completed_at": "2024-01-01T10:00:02.3Z"
}
```

### Get Run
`GET /api/runs/:id`

### Analyze Failed Run (GPT-4o)
`POST /api/runs/:id?action=analyze`

---

## Analytics
`GET /api/analytics?days=30&detect_anomalies=true`

---

## Budgets
- `GET /api/budgets`
- `POST /api/budgets`
- `PUT /api/budgets/:id`
- `DELETE /api/budgets/:id`

---

## Webhooks
- `GET /api/webhooks`
- `POST /api/webhooks`
- `PUT /api/webhooks/:id`
- `DELETE /api/webhooks/:id`

**Webhook Events**: `run.failed`, `run.success`, `budget.exceeded`, `budget.alert`, `anomaly.detected`

---

## Billing
- `POST /api/billing/create-checkout` — Start Stripe checkout
- `POST /api/billing/portal` — Open Stripe portal