import Anthropic from "@anthropic-ai/sdk";
import {
  trackAIError,
  measureAsync,
  addBreadcrumb,
} from "@/lib/utils/error-tracking";

let anthropicClient: Anthropic | null = null;

const AI_MODEL = "claude-sonnet-4-20250514";

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

export interface ChatOptions {
  systemPrompt: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  maxTokens?: number;
  agentType?: string;
}

export async function chat(options: ChatOptions): Promise<string> {
  const client = getAnthropicClient();
  const {
    systemPrompt,
    messages,
    maxTokens = 2048,
    agentType = "general",
  } = options;
  const startTime = Date.now();

  // Add breadcrumb for debugging
  addBreadcrumb(`AI chat request started: ${agentType}`, {
    category: "ai",
    level: "info",
    data: { agentType, messageCount: messages.length },
  });

  try {
    const response = await measureAsync(
      `ai.chat.${agentType}`,
      async () => {
        return client.messages.create({
          model: AI_MODEL,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });
      },
      { op: "ai.chat" },
    );

    const textContent = response.content.find((c) => c.type === "text");
    const responseText = textContent ? textContent.text : "";

    // Add success breadcrumb
    addBreadcrumb(`AI chat completed: ${agentType}`, {
      category: "ai",
      level: "info",
      data: {
        agentType,
        duration: Date.now() - startTime,
        tokensUsed: response.usage?.output_tokens,
      },
    });

    return responseText;
  } catch (error) {
    // Track the AI error with context
    trackAIError(error, {
      agentType,
      model: AI_MODEL,
      prompt: messages[messages.length - 1]?.content,
      duration: Date.now() - startTime,
    });

    // Re-throw the error for the caller to handle
    throw error;
  }
}

export async function* streamChat(
  options: ChatOptions,
): AsyncGenerator<string> {
  const client = getAnthropicClient();
  const {
    systemPrompt,
    messages,
    maxTokens = 2048,
    agentType = "general",
  } = options;
  const startTime = Date.now();

  // Add breadcrumb for debugging
  addBreadcrumb(`AI stream chat started: ${agentType}`, {
    category: "ai",
    level: "info",
    data: { agentType, messageCount: messages.length },
  });

  try {
    const stream = await client.messages.stream({
      model: AI_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }

    // Add success breadcrumb
    addBreadcrumb(`AI stream chat completed: ${agentType}`, {
      category: "ai",
      level: "info",
      data: {
        agentType,
        duration: Date.now() - startTime,
      },
    });
  } catch (error) {
    // Track the AI error with context
    trackAIError(error, {
      agentType,
      model: AI_MODEL,
      prompt: messages[messages.length - 1]?.content,
      duration: Date.now() - startTime,
    });

    // Re-throw the error for the caller to handle
    throw error;
  }
}
