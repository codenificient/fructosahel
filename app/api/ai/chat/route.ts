import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/ai-agents/client";
import { getAgentConfig } from "@/lib/ai-agents/config";
import type { AgentType } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentType, messages } = body as {
      agentType: AgentType;
      messages: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!agentType || !messages) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const agentConfig = getAgentConfig(agentType);

    if (!agentConfig) {
      return NextResponse.json(
        { error: "Invalid agent type" },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      // Return a mock response if no API key
      return NextResponse.json({
        content: getMockResponse(agentType, messages[messages.length - 1]?.content || ""),
      });
    }

    const response = await chat({
      systemPrompt: agentConfig.systemPrompt,
      messages,
      maxTokens: 2048,
    });

    return NextResponse.json({ content: response });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

// Mock responses for development without API key
function getMockResponse(agentType: AgentType, userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (agentType === "agronomist") {
    if (lowerMessage.includes("mango") || lowerMessage.includes("mangue")) {
      return `**Mango Cultivation in the Sahel**

Mangoes are well-suited to the Sahel climate. Here are key recommendations:

**Planting Time:**
- Plant at the start of the rainy season (June-July)
- This gives trees time to establish before the dry season

**Recommended Varieties:**
- Kent, Keitt, and Brooks for export
- Local Amelie for domestic markets

**Water Management:**
- Young trees need weekly watering in dry season
- Mature trees are drought tolerant
- Stop irrigation 2-3 months before flowering to induce stress

**Key Tips:**
1. Use windbreaks to protect from Harmattan
2. Apply NPK 15-15-15 fertilizer at start of rains
3. Monitor for fruit flies during fruiting

Would you like more specific information about any of these aspects?`;
    }

    if (lowerMessage.includes("pineapple") || lowerMessage.includes("ananas")) {
      return `**Pineapple Cultivation in the Sahel**

Pineapples can be successfully grown in the Sahel with proper irrigation:

**Water Requirements:**
- 25-50mm per week during dry season
- Drip irrigation is highly recommended
- Mulching reduces water needs by 30-40%

**Planting:**
- Can be planted year-round with irrigation
- Use suckers or crowns from healthy plants
- Space plants 30cm apart in rows 60cm apart

**Fertilization:**
- NPK 12-12-12, apply 10g per plant every 2 months
- Potassium boost before flowering improves fruit quality

**Heat Management:**
- Use shade cloth when temperatures exceed 40°C
- Morning watering reduces heat stress

Is there anything specific about pineapple cultivation you'd like to know more about?`;
    }

    return `Thank you for your question about agriculture in the Sahel region.

As an agronomist advisor, I can help you with:
- **Crop selection** - choosing the right varieties for your conditions
- **Planting schedules** - optimal timing for the Sahel climate
- **Water management** - irrigation strategies for the dry season
- **Fertilization** - NPK recommendations and organic options
- **Pest control** - integrated pest management approaches
- **Harvesting** - timing and post-harvest handling

Please provide more details about your specific crop, location, or challenge, and I'll give you tailored advice for Sahel conditions.`;
  }

  if (agentType === "marketing") {
    if (lowerMessage.includes("price") || lowerMessage.includes("prix")) {
      return `**Current Market Prices (Approximate)**

Here are typical prices in the Sahel region (in XOF per kg):

| Crop | Local Market | Export Grade |
|------|-------------|--------------|
| Mango | 300-500 | 800-1,200 |
| Cashew | 1,200-1,800 | 2,000-2,500 |
| Pineapple | 500-800 | 1,000-1,500 |
| Banana | 300-500 | 600-800 |
| Papaya | 400-600 | 800-1,000 |
| Avocado | 800-1,200 | 1,500-2,000 |

**Note:** Prices vary by:
- Season (lower during peak harvest)
- Quality and size
- Location and transportation costs
- Export vs. local market

Would you like advice on maximizing your sale price or finding buyers?`;
    }

    return `As your Marketing Advisor, I can help you with:

- **Market Analysis** - understanding demand and pricing trends
- **Buyer Networks** - connecting with local traders and exporters
- **Pricing Strategies** - maximizing value for your produce
- **Export Opportunities** - accessing European and regional markets
- **Quality Standards** - meeting buyer requirements
- **Branding** - differentiating your products

What specific marketing challenge can I help you with today?`;
  }

  if (agentType === "finance") {
    if (lowerMessage.includes("cost") || lowerMessage.includes("invest") || lowerMessage.includes("cout")) {
      return `**Farm Investment Analysis**

Here's a rough cost breakdown for establishing 1 hectare of fruit farm in the Sahel:

**Initial Investment (Year 1):**
| Item | Cost (XOF) |
|------|-----------|
| Land preparation | 150,000-300,000 |
| Seedlings | 200,000-500,000 |
| Irrigation setup | 500,000-1,500,000 |
| Fertilizers | 100,000-200,000 |
| Labor | 300,000-500,000 |
| **Total** | **1,250,000-3,000,000** |

**Annual Operating Costs:**
- Labor: 400,000-600,000 XOF
- Inputs: 200,000-400,000 XOF
- Maintenance: 100,000-200,000 XOF

**Expected Returns:**
- First harvest: Year 2-3 (depending on crop)
- Break-even: Year 3-5
- ROI: 20-40% annually once mature

Would you like a detailed budget for a specific crop?`;
    }

    return `As your Finance Advisor, I can help you with:

- **Budgeting** - creating realistic farm budgets
- **Investment Analysis** - evaluating ROI on farm improvements
- **Financing Options** - agricultural loans and grants in the Sahel
- **Cash Flow Management** - planning for seasonal variations
- **Cost Reduction** - identifying savings opportunities
- **Record Keeping** - tracking income and expenses

What financial aspect of your farm would you like to discuss?`;
  }

  return "I'm here to help. Please ask me a specific question about farming in the Sahel region.";
}
