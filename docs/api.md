# AgentDesk API Reference

Base URL: `https://agentdesk.app`

## Authentication

All API routes require authentication. Use one of:

1. **Session cookie** (for browser clients): Automatically set by Supabase Auth
2. **API Key header**: `Authorization: Bearer agd_<your-api-key>`

---

## Agents

### List Agents
```
GET /api/agents
```
Returns all non-deleted agents in the authenticated organization.

**Response**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "My Agent",
      "model": "gpt-4o-mini",
      "status": "active",
      "temperature": 0.7,
      "max_tokens": 1024,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Agent
```
POST /api/agents
Content-Type: application/json
```
**Body**
```json
{
  "name": "My Agent",
  "description": "Optional description",
  "model": "gpt-4o-mini",
  "system_prompt": "You are a helpful assistant.",
  "temperature": 0.7,
  "max_tokens": 1024
}
```

**Errors**: 400 (validation), 403 (plan limit), 429 (rate limit)

### Execute Agent
```
POST /api/agents/:id/execute
Content-Type: application/json
```
**Body**
```json
{ "input": "Your message to the agent" }
```
**Response**
```json
{
  "data": {
    "id": "uuid",
    "status": "success",
    "output": "Agent response text",
    "tokens_used": 142,
    "cost_usd": 0.0000213,
    "duration_ms": 1240
  }
}
```
**Rate limit**: 10 req/min

---

## Executions

### List Executions
```
GET /api/executions?page=1&per_page=50&status=success&agent_id=<uuid>
```

**Query params**:
- `page` (default: 1)
- `per_page` (default: 50, max: 100)
- `status` filter: `success | failed | running`
- `agent_id` filter

---

## Analytics

### Get Analytics
```
GET /api/analytics?start_date=2024-01-01&end_date=2024-01-31
```

**Response**
```json
{
  "data": {
    "daily": [{ "date": "2024-01-01", "success": 42, "failed": 2, "tokens": 15000, "cost": 0.23 }],
    "by_agent": [{ "name": "My Agent", "cost": 1.42, "count": 150, "success": 148 }],
    "totals": { "executions": 500, "tokens": 200000, "cost_usd": 15.42, "success_rate": "98.4" }
  }
}
```

---

## API Keys

### List Keys
```
GET /api/api-keys
```
Returns keys with prefix only (first 12 chars). Never returns full key.

### Create Key
```
POST /api/api-keys
Content-Type: application/json

{ "name": "Production Key" }
```
Returns full key **once** — store it securely.

### Revoke Key
```
DELETE /api/api-keys?id=<uuid>
```

---

## Webhooks

### Events
- `execution.complete` — fires after every agent execution

### Payload
```json
{
  "event": "execution.complete",
  "execution": {
    "id": "uuid",
    "agent_id": "uuid",
    "status": "success",
    "output": "...",
    "tokens_used": 142,
    "cost_usd": 0.0000213
  }
}
```

### Verification
```javascript
const signature = request.headers["x-agentdesk-secret"];
// Compare with your webhook secret
```

---

## Billing

### Create Checkout Session
```
POST /api/billing/create-checkout
Content-Type: application/json

{ "planId": "starter" | "pro" | "enterprise" }
```
Returns `{ "url": "https://checkout.stripe.com/..." }` — redirect user to this URL.

### Customer Portal
```
POST /api/billing/portal
```
Returns `{ "url": "https://billing.stripe.com/..." }` — redirect user for self-serve management.