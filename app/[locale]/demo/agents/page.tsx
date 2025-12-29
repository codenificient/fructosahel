"use client";

import {
  Bot,
  Calculator,
  Plus,
  Send,
  Sprout,
  TrendingUp,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { AgentType } from "@/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const agentIcons = {
  marketing: TrendingUp,
  finance: Calculator,
  agronomist: Sprout,
};

const agentColors = {
  marketing: "text-blue-500 bg-blue-500/10",
  finance: "text-green-500 bg-green-500/10",
  agronomist: "text-amber-500 bg-amber-500/10",
};

const sampleResponses: Record<AgentType, string[]> = {
  agronomist: [
    "For mango cultivation in the Sahel, the best planting time is at the start of the rainy season (June-July). This gives trees enough moisture to establish roots before the dry season.",
    "Pineapples in the dry season need about 25-30mm of water per week. Consider drip irrigation to conserve water and reduce evaporation losses.",
    "For fruit fly control in mango orchards, I recommend protein bait traps, maintaining orchard hygiene, and early harvesting of affected fruits.",
  ],
  marketing: [
    "Current cashew prices in the Sahel range from 1,200-1,800 XOF/kg depending on quality. Premium processed cashews fetch up to 2,500 XOF/kg in export markets.",
    "To find mango exporters, connect with agricultural cooperatives, attend regional trade fairs, and register on platforms like Agromarket Africa.",
    "For organic pineapples, focus on premium urban markets and export opportunities. Certification can increase prices by 30-40%.",
  ],
  finance: [
    "A 1-hectare mango farm startup costs approximately 2.5-3.5 million XOF, including land preparation, seedlings, irrigation, and first-year maintenance.",
    "Cashew ROI typically ranges 40-60% after 4-5 years. Initial investment is recovered within 6-7 years with proper management.",
    "For agricultural financing in Mali, explore BNDA, micro-finance institutions, and NGO programs like USAID's Feed the Future.",
  ],
};

export default function DemoAgentsPage() {
  const t = useTranslations();
  const [selectedAgent, setSelectedAgent] = useState<AgentType>("agronomist");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingRef = useRef<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const agents: {
    type: AgentType;
    icon: typeof TrendingUp;
    nameKey: string;
    descKey: string;
  }[] = [
    {
      type: "marketing",
      icon: TrendingUp,
      nameKey: "agents.marketing.name",
      descKey: "agents.marketing.description",
    },
    {
      type: "finance",
      icon: Calculator,
      nameKey: "agents.finance.name",
      descKey: "agents.finance.description",
    },
    {
      type: "agronomist",
      icon: Sprout,
      nameKey: "agents.agronomist.name",
      descKey: "agents.agronomist.description",
    },
  ];

  const handleDemoSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);
    streamingRef.current = true;

    // Create empty assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    const responses = sampleResponses[selectedAgent];
    const fullResponse =
      responses[Math.floor(Math.random() * responses.length)];

    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Simulate streaming word by word
    const words = fullResponse.split(" ");
    for (let i = 0; i < words.length; i++) {
      if (!streamingRef.current) break;
      await new Promise((r) => setTimeout(r, 30 + Math.random() * 40));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: m.content + (i > 0 ? " " : "") + words[i] }
            : m,
        ),
      );
    }

    setIsStreaming(false);
  };

  const startNewConversation = () => {
    streamingRef.current = false;
    setMessages([]);
    setIsStreaming(false);
  };

  const AgentIcon = agentIcons[selectedAgent];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Agent Selection Sidebar */}
      <div className="w-80 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("agents.title")}</CardTitle>
            <CardDescription>{t("agents.selectAgent")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {agents.map((agent) => {
              const Icon = agent.icon;
              const isSelected = selectedAgent === agent.type;
              return (
                <button
                  type="button"
                  key={agent.type}
                  onClick={() => {
                    setSelectedAgent(agent.type);
                    startNewConversation();
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all hover:bg-muted",
                    isSelected && "border-primary bg-primary/5",
                  )}
                >
                  <div
                    className={cn("rounded-lg p-2", agentColors[agent.type])}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{t(agent.nameKey)}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {t(agent.descKey)}
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full"
          onClick={startNewConversation}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("agents.newConversation")}
        </Button>

        {/* Demo Notice */}
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            Demo mode: Responses are pre-written samples. Sign in to chat with
            real AI agents.
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex flex-1 flex-col">
        {/* Chat Header */}
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className={cn("rounded-lg p-2", agentColors[selectedAgent])}>
              <AgentIcon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {t(`agents.${selectedAgent}.name`)}
              </CardTitle>
              <CardDescription>
                {t(`agents.${selectedAgent}.description`)}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="ml-auto">
              Demo Mode
            </Badge>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div
                className={cn("rounded-full p-4", agentColors[selectedAgent])}
              >
                <AgentIcon className="h-12 w-12" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                {t(`agents.${selectedAgent}.name`)}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {t(`agents.${selectedAgent}.description`)}
              </p>
              <div className="mt-6 grid gap-2 text-sm">
                <p className="text-muted-foreground">Try asking:</p>
                {selectedAgent === "agronomist" && (
                  <>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        setInput(
                          "What's the best time to plant mangoes in Burkina Faso?",
                        )
                      }
                    >
                      "What's the best time to plant mangoes?"
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        setInput(
                          "How much water do pineapples need during the dry season?",
                        )
                      }
                    >
                      "How much water do pineapples need?"
                    </Badge>
                  </>
                )}
                {selectedAgent === "marketing" && (
                  <>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        setInput(
                          "What's the current market price for cashews in the Sahel?",
                        )
                      }
                    >
                      "Current cashew prices?"
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        setInput("How can I find export buyers for my mangoes?")
                      }
                    >
                      "How to find mango exporters?"
                    </Badge>
                  </>
                )}
                {selectedAgent === "finance" && (
                  <>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        setInput(
                          "How much does it cost to start a 1-hectare mango farm?",
                        )
                      }
                    >
                      "Cost of 1ha mango farm?"
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        setInput(
                          "What's the expected ROI for cashew cultivation?",
                        )
                      }
                    >
                      "ROI for cashew farming?"
                    </Badge>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" && "flex-row-reverse",
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}
                  >
                    {message.role === "assistant" && message.content === "" ? (
                      <span className="inline-block h-4 w-2 animate-pulse bg-current opacity-70" />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </p>
                    )}
                    {message.content !== "" && (
                      <p className="mt-1 text-xs opacity-50">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder={t("agents.typeMessage")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleDemoSend();
                }
              }}
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
            <Button
              onClick={handleDemoSend}
              disabled={!input.trim() || isStreaming}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
