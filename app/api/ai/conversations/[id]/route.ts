import { and, asc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { ApiError, handleApiError, notFound, success } from "@/lib/api/errors";
import { agentConversations, agentMessages, db, users } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";

// GET /api/ai/conversations/[id] - Get a conversation with all messages
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

    // Find the conversation and verify ownership
    const conversation = await db.query.agentConversations.findFirst({
      where: and(
        eq(agentConversations.id, id),
        eq(agentConversations.userId, dbUser.id),
      ),
      with: {
        messages: {
          orderBy: [asc(agentMessages.createdAt)],
        },
      },
    });

    if (!conversation) {
      return notFound("Conversation");
    }

    return success(conversation);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/ai/conversations/[id] - Delete a conversation
export async function DELETE(
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

    // Verify ownership before deleting
    const conversation = await db.query.agentConversations.findFirst({
      where: and(
        eq(agentConversations.id, id),
        eq(agentConversations.userId, dbUser.id),
      ),
    });

    if (!conversation) {
      return notFound("Conversation");
    }

    // Delete the conversation (messages will cascade delete due to schema)
    await db.delete(agentConversations).where(eq(agentConversations.id, id));

    return success({ message: "Conversation deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/ai/conversations/[id] - Update conversation title
export async function PATCH(
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
    const { title } = body;

    // Find the user in our database
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, user.primaryEmail || ""),
    });

    if (!dbUser) {
      throw new ApiError(401, "User not found");
    }

    // Verify ownership before updating
    const conversation = await db.query.agentConversations.findFirst({
      where: and(
        eq(agentConversations.id, id),
        eq(agentConversations.userId, dbUser.id),
      ),
    });

    if (!conversation) {
      return notFound("Conversation");
    }

    // Update the conversation
    const [updated] = await db
      .update(agentConversations)
      .set({
        title,
        updatedAt: new Date(),
      })
      .where(eq(agentConversations.id, id))
      .returning();

    return success(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
