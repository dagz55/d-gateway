import {
  metadataCorsOptionsRequestHandler,
  protectedResourceHandlerClerk,
} from "@clerk/mcp-tools/next";

export const GET = protectedResourceHandlerClerk({
  scopes_supported: ["profile", "email"],
});
export const OPTIONS = metadataCorsOptionsRequestHandler();