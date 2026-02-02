import { useCallback, useEffect, useState } from "react";
import type { AgentConversation, AgentMessage, AgentType } from "@/types";

const API_BASE = "/api/ai";

// Types for conversation list items
export interface ConversationListItem {
  id: string;
  agentType: AgentType;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
}

// Types for conversation with messages
export interface ConversationWithMessages extends AgentConversation {
  messages: AgentMessage[];
}

// Hook for fetching list of conversations
export function useConversations() {
  const [conversations, setConversations] = useState<ConversationListItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/conversations`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch conversations"),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    refetch: fetchConversations,
  };
}

// Hook for fetching a single conversation with messages
export function useConversation(conversationId: string | null) {
  const [conversation, setConversation] =
    useState<ConversationWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchConversation = useCallback(async () => {
    if (!conversationId) {
      setConversation(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE}/conversations/${conversationId}`,
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      setConversation(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch conversation"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  return {
    conversation,
    isLoading,
    error,
    refetch: fetchConversation,
  };
}

// Hook for creating a new conversation
export function useCreateConversation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createConversation = useCallback(
    async (
      agentType: AgentType,
      title?: string,
    ): Promise<AgentConversation | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/conversations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentType, title }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const errorObj =
          err instanceof Error
            ? err
            : new Error("Failed to create conversation");
        setError(errorObj);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    createConversation,
    isLoading,
    error,
  };
}

// Hook for deleting a conversation
export function useDeleteConversation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteConversation = useCallback(
    async (conversationId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE}/conversations/${conversationId}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }

        return true;
      } catch (err) {
        const errorObj =
          err instanceof Error
            ? err
            : new Error("Failed to delete conversation");
        setError(errorObj);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    deleteConversation,
    isLoading,
    error,
  };
}

// Hook for adding a message to a conversation
export function useAddMessage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addMessage = useCallback(
    async (
      conversationId: string,
      role: "user" | "assistant",
      content: string,
      metadata?: Record<string, unknown>,
    ): Promise<AgentMessage | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE}/conversations/${conversationId}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, content, metadata }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("Failed to add message");
        setError(errorObj);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    addMessage,
    isLoading,
    error,
  };
}

// Hook for updating conversation title
export function useUpdateConversationTitle() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTitle = useCallback(
    async (
      conversationId: string,
      title: string,
    ): Promise<AgentConversation | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE}/conversations/${conversationId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const errorObj =
          err instanceof Error
            ? err
            : new Error("Failed to update conversation");
        setError(errorObj);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    updateTitle,
    isLoading,
    error,
  };
}
