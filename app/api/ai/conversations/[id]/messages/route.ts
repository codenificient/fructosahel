import { and, asc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import {
  ApiError,
  created,
  handleApiError,
  notFound,
  success,
} from "@/lib/api/errors";
import { agentConversations, agentMessages, db, users } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";

// GET /api/ai/conversations/[id]/messages - Get all messages for a conversation
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = await params;

    // Find the user in our database
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, user.primaryEmail || ""),
    });

    if (!dbUser) {
      throw new ApiError(401, "User not found");
    }

    // Verify conversation ownership
    const conversation = await db.query.agentConversations.findFirst({
      where: and(
        eq(agentConversations.id, id),
        eq(agentConversations.userId, dbUser.id),
      ),
    });

    if (!conversation) {
      return notFound("Conversation");
    }

    const messages = await db.query.agentMessages.findMany({
      where: eq(agentMessages.conversationId, id),
      orderBy: [asc(agentMessages.createdAt)],
    });

    return success(messages);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/ai/conversations/[id]/messages - Add a message to a conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = await params;
    const body = await request.json();
    const { role, content, metadata } = body;

    if (!role || !["user", "assistant"].includes(role)) {
      throw new ApiError(400, "Invalid role. Must be 'user' or 'assistant'");
    }

    if (!content || typeof content !== "string") {
      throw new ApiError(400, "Content is required");
    }

    // Find the user in our database
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, user.primaryEmail || ""),
    });

    if (!dbUser) {
      throw new ApiError(401, "User not found");
    }

    // Verify conversation ownership
    const conversation = await db.query.agentConversations.findFirst({
      where: and(
        eq(agentConversations.id, id),
        eq(agentConversations.userId, dbUser.id),
      ),
    });

    if (!conversation) {
      return notFound("Conversation");
    }

    // Create the message
    const [newMessage] = await db
      .insert(agentMessages)
      .values({
        conversationId: id,
        role,
        content,
        metadata: metadata || null,
      })
      .returning();

    // Update conversation's updatedAt timestamp
    await db
      .update(agentConversations)
      .set({ updatedAt: new Date() })
      .where(eq(agentConversations.id, id));

    // If this is the first user message and conversation has no title, generate one
    if (role === "user" && !conversation.title) {
      const title = generateTitle(content);
      await db
        .update(agentConversations)
        .set({ title })
        .where(eq(agentConversations.id, id));
    }

    return created(newMessage);
  } catch (error) {
    return handleApiError(error);
  }
}

// Helper function to generate a title from the first message
function generateTitle(content: string): string {
  const words = content.split(" ").slice(0, 6);
  return words.join(" ") + (words.length >= 6 ? "..." : "");
}
