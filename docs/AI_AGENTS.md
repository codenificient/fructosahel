# AI Agents Documentation

## Overview

FructoSahel includes three specialized AI advisory agents powered by Anthropic's Claude API. Each agent has deep expertise in their domain, specifically tailored for Sahel agricultural conditions.

## Agents

### 1. Agronomist Advisor

**Purpose**: Provide expert guidance on crop science, cultivation techniques, and farm management.

**Expertise Areas**:
- Crop selection and varieties for Sahel conditions
- Planting schedules optimized for local climate
- Water management and irrigation strategies
- Soil preparation and improvement
- Fertilization programs (organic and mineral)
- Integrated Pest Management (IPM)
- Harvesting techniques and timing
- Post-harvest handling

**Sahel-Specific Knowledge**:
- Climate adaptation (400-900mm rainfall, extreme heat)
- Drought-resistant techniques (zai pits, half-moons)
- Harmattan wind protection
- Water conservation methods
- Local variety recommendations

**Example Questions**:
- "What's the best time to plant mangoes in Burkina Faso?"
- "How much water do pineapples need during dry season?"
- "How do I control fruit flies in my cashew orchard?"

### 2. Marketing Advisor

**Purpose**: Help farmers maximize value through market intelligence and sales strategies.

**Expertise Areas**:
- Market analysis and demand trends
- Pricing strategies for local and export markets
- Buyer networks (traders, cooperatives, exporters)
- Marketing channels (traditional markets, hotels, supermarkets)
- Quality standards for different market segments
- Seasonal timing for optimal prices
- Value addition opportunities (processing)
- Export procedures and requirements

**Regional Knowledge**:
- Major markets: Ouagadougou, Bobo-Dioulasso, Bamako, Niamey
- Export destinations: Europe, Middle East, regional
- Currency: XOF pricing
- Local traders and cooperatives
- Transportation and logistics

**Example Questions**:
- "What's the current market price for cashews?"
- "How can I find export buyers for my mangoes?"
- "When is the best time to sell papayas?"

### 3. Finance Advisor

**Purpose**: Support financial planning, investment decisions, and business management.

**Expertise Areas**:
- Farm budgeting and planning
- Investment analysis and ROI calculations
- Cash flow management for seasonal farming
- Financing options (microfinance, banks, grants)
- Cost analysis per hectare/kilogram
- Risk management and insurance
- Record keeping best practices
- Tax and legal considerations

**Regional Context**:
- Currency: XOF (West African CFA franc)
- Typical labor costs: 2,000-3,500 XOF/day
- Interest rates: 8-15% for agricultural loans
- Microfinance institutions in each country
- International development programs

**Example Questions**:
- "How much does it cost to start a 1-hectare mango farm?"
- "What's the expected ROI for cashew cultivation?"
- "How can I get agricultural financing in Mali?"

## Technical Implementation

### Configuration

Each agent has a detailed system prompt in `/lib/ai-agents/config.ts`:

```typescript
export const agentConfigs: Record<AgentType, AgentConfig> = {
  marketing: {
    type: "marketing",
    name: "Marketing Advisor",
    description: "...",
    icon: "TrendingUp",
    systemPrompt: `...detailed prompt...`,
  },
  // ...
};
```

### API Integration

The chat API route (`/api/ai/chat`) handles requests:

```typescript
// POST /api/ai/chat
{
  agentType: "agronomist",
  messages: [
    { role: "user", content: "How do I grow mangoes?" },
    { role: "assistant", content: "..." },
    { role: "user", content: "What about irrigation?" }
  ]
}
```

### Claude API Usage

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 2048,
  system: agentConfig.systemPrompt,
  messages: messages,
});
```

### Fallback Responses

When no API key is configured, the system provides intelligent mock responses based on keywords in the user's question.

## System Prompts

### Best Practices

1. **Specificity**: Each prompt includes detailed regional context
2. **Actionability**: Agents provide practical, implementable advice
3. **Currency Awareness**: All financial advice uses XOF
4. **Local Relevance**: Recommendations consider local availability
5. **Bilingual Support**: Agents can respond in French or English

### Prompt Structure

```
1. Role definition
2. Expertise areas (numbered list)
3. Key regional context
4. Behavioral guidelines
```

## Database Storage

Conversations are stored for:
- User history and continuity
- Training data collection
- Analytics and improvement

Tables:
- `agent_conversations`: Session metadata
- `agent_messages`: Individual messages with timestamps

## Future Enhancements

1. **Streaming Responses**: Real-time text streaming for better UX
2. **Context Enrichment**: Include user's farm data in prompts
3. **Multi-Agent Collaboration**: Agents consulting each other
4. **Voice Interface**: Audio input/output for field use
5. **Image Analysis**: Crop disease identification from photos
6. **Scheduled Advice**: Proactive recommendations based on crop status

## Rate Limiting

Implement rate limiting for production:
- Per-user limits
- Daily quotas
- Cost management

## Security

- API key stored in environment variables
- User authentication required for agent access
- Message content sanitization
- No PII in system prompts
