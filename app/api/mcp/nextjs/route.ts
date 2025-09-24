import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/clerk-auth';
import { createClerkClient } from '@clerk/backend';

// MCP Gateway configuration
const MCP_GATEWAY_URL = process.env.MCP_GATEWAY_URL || 'http://localhost:8080';
const GATEWAY_TIMEOUT = 10000; // 10 seconds

interface MCPRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

/**
 * POST /api/mcp/nextjs
 * Proxy MCP requests to the gateway with Clerk OAuth authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          message: 'Clerk OAuth token required' 
        }, 
        { status: 401 }
      );
    }

    // Parse the MCP request
    const mcpRequest: MCPRequest = await request.json();
    
    // Validate MCP request structure
    if (!mcpRequest.jsonrpc || !mcpRequest.id || !mcpRequest.method) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid MCP request',
          message: 'Request must include jsonrpc, id, and method' 
        }, 
        { status: 400 }
      );
    }

    // Get service name from query parameters or request body
    const { searchParams } = new URL(request.url);
    const serviceName = searchParams.get('service') || mcpRequest.params?.service || 'filesystem';

    // Create OAuth token for the gateway
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Configuration error',
          message: 'CLERK_SECRET_KEY not configured' 
        }, 
        { status: 500 }
      );
    }

    // Create a session token for the user
    const clerkClient = createClerkClient({ secretKey: clerkSecretKey });
    const sessionToken = await clerkClient.sessions.createSession({
      userId: user.id,
      expiresInSeconds: 3600 // 1 hour
    });

    // Prepare headers for the gateway request
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken.id}`,
      'X-User-ID': user.id,
      'X-User-Email': user.emailAddresses[0]?.emailAddress || '',
      'X-User-Role': user.publicMetadata?.role || 'member',
      'X-Request-ID': crypto.randomUUID(),
      'X-Timestamp': new Date().toISOString()
    };

    // Make request to MCP gateway
    const gatewayUrl = `${MCP_GATEWAY_URL}/mcp/${serviceName}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GATEWAY_TIMEOUT);

    try {
      const response = await fetch(gatewayUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(mcpRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { 
            success: false, 
            error: 'Gateway error',
            message: `Gateway returned ${response.status}: ${errorText}`,
            gatewayStatus: response.status,
            gatewayUrl
          }, 
          { status: 502 }
        );
      }

      const mcpResponse: MCPResponse = await response.json();

      // Validate MCP response structure
      if (!mcpResponse.jsonrpc || !mcpResponse.id) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid MCP response',
            message: 'Gateway returned invalid MCP response structure' 
          }, 
          { status: 502 }
        );
      }

      // Log successful request for monitoring
      console.log(`MCP request successful: ${serviceName}/${mcpRequest.method}`, {
        userId: user.id,
        serviceName,
        method: mcpRequest.method,
        requestId: mcpRequest.id,
        responseId: mcpResponse.id,
        hasResult: !!mcpResponse.result,
        hasError: !!mcpResponse.error,
        timestamp: new Date().toISOString()
      });

      // Return the MCP response
      return NextResponse.json({
        success: true,
        data: mcpResponse,
        metadata: {
          serviceName,
          userId: user.id,
          userEmail: user.emailAddresses[0]?.emailAddress,
          userRole: user.publicMetadata?.role || 'member',
          requestId: mcpRequest.id,
          responseId: mcpResponse.id,
          timestamp: new Date().toISOString(),
          gatewayUrl
        }
      });

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Gateway timeout',
            message: `Gateway request timed out after ${GATEWAY_TIMEOUT}ms`,
            gatewayUrl
          }, 
          { status: 504 }
        );
      }

      throw error;
    }

  } catch (error: any) {
    console.error('MCP API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/mcp/nextjs
 * Get available MCP services and their status
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          message: 'Clerk OAuth token required' 
        }, 
        { status: 401 }
      );
    }

    // Get services from gateway
    const servicesUrl = `${MCP_GATEWAY_URL}/services`;
    
    const response = await fetch(servicesUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': user.id,
        'X-User-Email': user.emailAddresses[0]?.emailAddress || ''
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gateway error',
          message: `Failed to get services: ${response.status}` 
        }, 
        { status: 502 }
      );
    }

    const servicesData = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        services: servicesData.services || [],
        gatewayUrl: MCP_GATEWAY_URL,
        userId: user.id,
        userEmail: user.emailAddresses[0]?.emailAddress,
        userRole: user.publicMetadata?.role || 'member',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('MCP services API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred' 
      }, 
      { status: 500 }
    );
  }
}
