import { verifyClerkToken } from "@clerk/mcp-tools/next";
import { auth } from "@clerk/nextjs/server";
import { getClerkUserById } from "@/lib/clerk-users";

// Import MCP adapter functions
import { createMcpHandler } from "@vercel/mcp-adapter";
import { experimental_withMcpAuth as withMcpAuth } from "@vercel/mcp-adapter";

export const runtime = "nodejs";

const handler = createMcpHandler(server => {
  server.tool("get-clerk-user-data", {
    description: "Gets data about the Clerk user that authorized this request",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    },
    execute: async ({ authInfo }) => {
      const userId = authInfo?.extra?.userId;

      if (!userId || typeof userId !== "string") {
        throw new Error("Missing Clerk userId in auth info");
      }

      const userData = await getClerkUserById(userId);

      if (!userData) {
        throw new Error("Clerk user not found");
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(userData)
          }
        ]
      };
    }
  });
});

const authHandler = withMcpAuth(
  handler,
  async (_req, token) => {
    const clerkAuth = await auth({ acceptsToken: "oauth_token" });
    return verifyClerkToken(clerkAuth, token);
  },
  {
    required: true,
    resourceMetadataPath: "/.well-known/oauth-protected-resource/mcp"
  }
);

export { authHandler as GET, authHandler as POST };