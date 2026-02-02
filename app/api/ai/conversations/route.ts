import { desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { ApiError, created, handleApiError, success } from "@/lib/api/errors";
import { agentConversations, db, users } from "@/lib/db";
import { stackServerApp } from "@/lib/stack";

// GET /api/ai/conversations - List user's conversations
export async function GET(_request: NextRequest) {
  try {
    // Get the current user from Stack Auth
    const user = await stackServerApp.getUser();

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    // Find or create the user in our database
    const dbUser = await getOrCreateUser(
      user.id,
      user.primaryEmail || "",
      user.displayName || "User",
    );

    const conversations = await db.query.agentConversations.findMany({
      where: eq(agentConversations.userId, dbUser.id),
      orderBy: [desc(agentConversations.updatedAt)],
      with: {
        messages: {
          orderBy: (messages, { asc }) => [asc(messages.createdAt)],
          limit: 1, // Just get the first message for preview
        },
      },
    });

    // Transform the data for the frontend
    const transformedConversations = conversations.map((conv) => ({
      id: conv.id,
      agentType: conv.agentType,
      title: conv.title || generateTitle(conv.messages[0]?.content),
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: conv.messages.length,
      preview: conv.messages[0]?.content?.substring(0, 100) || "",
    }));

    return success(transformedConversations);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/ai/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const body = await request.json();
    const { agentType, title } = body;

    if (
      !agentType ||
      !["marketing", "finance", "agronomist"].includes(agentType)
    ) {
      throw new ApiError(400, "Invalid agent type");
    }

    // Find or create the user in our database
    const dbUser = await getOrCreateUser(
      user.id,
      user.primaryEmail || "",
      user.displayName || "User",
    );

    const [newConversation] = await db
      .insert(agentConversations)
      .values({
        userId: dbUser.id,
        agentType,
        title: title || null,
      })
      .returning();

    return created(newConversation);
  } catch (error) {
    return handleApiError(error);
  }
}

// Helper function to generate a title from the first message
function generateTitle(content?: string): string {
  if (!content) return "New Conversation";
  const words = content.split(" ").slice(0, 5);
  return words.join(" ") + (words.length >= 5 ? "..." : "");
}

// Helper function to get or create a user in our database based on Stack Auth
async function getOrCreateUser(
  _stackUserId: string,
  email: string,
  name: string,
) {
  // First, try to find the user by email
  let dbUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  // If not found, create a new user
  if (!dbUser) {
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        role: "viewer",
      })
      .returning();
    dbUser = newUser;
  }

  return dbUser;
}
