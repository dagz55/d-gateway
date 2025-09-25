/**
 * WebSocket Monitor - Monitors WebSocket connections and realtime services
 *
 * This monitor provides:
 * - Supabase realtime connection monitoring
 * - Trading WebSocket connection monitoring
 * - Connection health tracking
 * - Automatic reconnection with exponential backoff
 * - Connection metrics and statistics
 * - Event-driven status updates
 */

import { createRealtimeClient, getRealtimeStatus, reconnectRealtime } from '@/lib/supabase/realtime-client';
import type { NetworkIssue } from './network-agent';

export interface WebSocketStatus {
  supabase: 'connected' | 'connecting' | 'disconnected' | 'error';
  trading: 'connected' | 'connecting' | 'disconnected' | 'error';
}

export interface WebSocketConnection {
  id: string;
  type: 'supabase' | 'trading';
  url: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  connectedAt?: string;
  disconnectedAt?: string;
  reconnectAttempts: number;
  latency: number;
  lastPing: string;
  autoReconnect: boolean;
  backoffDelay: number;
}

export interface WebSocketMetrics {
  totalConnections: number;
  activeConnections: number;
  totalReconnects: number;
  totalMessages: number;
  avgLatency: number;
  uptime: {
    supabase: number;
    trading: number;
    overall: number;
  };
  errorCount: number;
  lastError?: string;
}

export class WebSocketMonitor {
  private connections = new Map<string, WebSocketConnection>();
  private metrics: WebSocketMetrics;
  private startTime = Date.now();

  private statusListeners: ((status: WebSocketStatus) => void)[] = [];
  private issueListeners: ((issue: NetworkIssue) => void)[] = [];
  private messageListeners: ((connection: string, message: any) => void)[] = [];

  private pingInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;

  private supabaseClient: any = null;
  private tradingWs: WebSocket | null = null;

  private isRunning = false;

  constructor() {
    this.metrics = this.initializeMetrics();
    this.setupSupabaseConnection();
  }

  /**
   * Start WebSocket monitoring
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('WebSocket monitor is already running');
      return;
    }

    console.log('Starting WebSocket Monitor...');
    this.isRunning = true;

    try {
      // Initialize connections
      await this.initializeSupabaseConnection();
      await this.initializeTradingConnection();

      // Start periodic health checks
      this.startPeriodicChecks();

      console.log('WebSocket Monitor started successfully');
    } catch (error) {
      console.error('Failed to start WebSocket Monitor:', error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop WebSocket monitoring
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping WebSocket Monitor...');
    this.isRunning = false;

    // Clear intervals
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);

    // Close all connections
    await this.closeAllConnections();

    console.log('WebSocket Monitor stopped');
  }

  /**
   * Get current WebSocket status
   */
  public async getStatus(): Promise<WebSocketStatus> {
    const supabaseStatus = await this.getSupabaseStatus();
    const tradingStatus = this.getTradingStatus();

    return {
      supabase: supabaseStatus,
      trading: tradingStatus
    };
  }

  /**
   * Get WebSocket metrics
   */
  public getMetrics(): WebSocketMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Get connection details
   */
  public getConnections(): WebSocketConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Reconnect Supabase WebSocket
   */
  public async reconnectSupabase(): Promise<boolean> {
    console.log('Attempting to reconnect Supabase WebSocket...');

    const connection = this.connections.get('supabase');
    if (!connection) {
      console.error('Supabase connection not found');
      return false;
    }

    try {
      connection.status = 'connecting';
      connection.reconnectAttempts++;
      this.updateConnectionStatus('supabase', 'connecting');

      // Attempt Supabase reconnection
      const success = await reconnectRealtime();

      if (success) {
        connection.status = 'connected';
        connection.connectedAt = new Date().toISOString();
        connection.backoffDelay = 1000; // Reset backoff
        this.updateConnectionStatus('supabase', 'connected');

        this.metrics.totalReconnects++;
        console.log('Supabase WebSocket reconnected successfully');
        return true;
      } else {
        connection.status = 'error';
        this.updateConnectionStatus('supabase', 'error');
        this.reportIssue({
          id: `ws-supabase-reconnect-${Date.now()}`,
          severity: 'high',
          type: 'websocket',
          title: 'Supabase WebSocket Reconnection Failed',
          description: `Failed to reconnect Supabase WebSocket after ${connection.reconnectAttempts} attempts`,
          detectedAt: new Date().toISOString()
        });
        return false;
      }
    } catch (error) {
      console.error('Error during Supabase reconnection:', error);
      connection.status = 'error';
      this.updateConnectionStatus('supabase', 'error');
      return false;
    }
  }

  /**
   * Reconnect trading WebSocket
   */
  public async reconnectTrading(): Promise<boolean> {
    console.log('Attempting to reconnect Trading WebSocket...');

    const connection = this.connections.get('trading');
    if (!connection) {
      console.error('Trading connection not found');
      return false;
    }

    try {
      connection.status = 'connecting';
      connection.reconnectAttempts++;
      this.updateConnectionStatus('trading', 'connecting');

      // Close existing connection
      if (this.tradingWs) {
        this.tradingWs.close();
      }

      // Create new connection
      await this.createTradingWebSocket();

      return true;
    } catch (error) {
      console.error('Error during trading WebSocket reconnection:', error);
      connection.status = 'error';
      this.updateConnectionStatus('trading', 'error');
      return false;
    }
  }

  /**
   * Add status change listener
   */
  public onStatusChange(callback: (status: WebSocketStatus) => void): () => void {
    this.statusListeners.push(callback);
    return () => {
      const index = this.statusListeners.indexOf(callback);
      if (index > -1) {
        this.statusListeners.splice(index, 1);
      }
    };
  }

  /**
   * Add issue listener
   */
  public onIssue(callback: (issue: NetworkIssue) => void): () => void {
    this.issueListeners.push(callback);
    return () => {
      const index = this.issueListeners.indexOf(callback);
      if (index > -1) {
        this.issueListeners.splice(index, 1);
      }
    };
  }

  /**
   * Add message listener
   */
  public onMessage(callback: (connection: string, message: any) => void): () => void {
    this.messageListeners.push(callback);
    return () => {
      const index = this.messageListeners.indexOf(callback);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    };
  }

  private initializeMetrics(): WebSocketMetrics {
    return {
      totalConnections: 0,
      activeConnections: 0,
      totalReconnects: 0,
      totalMessages: 0,
      avgLatency: 0,
      uptime: {
        supabase: 0,
        trading: 0,
        overall: 0
      },
      errorCount: 0
    };
  }

  private setupSupabaseConnection(): void {
    // Initialize Supabase connection record
    this.connections.set('supabase', {
      id: 'supabase',
      type: 'supabase',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      status: 'disconnected',
      reconnectAttempts: 0,
      latency: 0,
      lastPing: new Date().toISOString(),
      autoReconnect: true,
      backoffDelay: 1000
    });
  }

  private async initializeSupabaseConnection(): Promise<void> {
    const connection = this.connections.get('supabase');
    if (!connection) return;

    try {
      console.log('Initializing Supabase realtime connection...');
      connection.status = 'connecting';
      this.updateConnectionStatus('supabase', 'connecting');

      // Get or create Supabase client
      this.supabaseClient = createRealtimeClient();

      // Set up realtime event listeners
      if (this.supabaseClient.realtime) {
        this.supabaseClient.realtime
          .onOpen(() => {
            console.log('Supabase realtime connected');
            connection.status = 'connected';
            connection.connectedAt = new Date().toISOString();
            connection.backoffDelay = 1000; // Reset backoff
            this.updateConnectionStatus('supabase', 'connected');
          })
          .onClose(() => {
            console.log('Supabase realtime disconnected');
            connection.status = 'disconnected';
            connection.disconnectedAt = new Date().toISOString();
            this.updateConnectionStatus('supabase', 'disconnected');

            if (connection.autoReconnect && this.isRunning) {
              this.scheduleReconnect('supabase');
            }
          })
          .onError((error: any) => {
            console.error('Supabase realtime error:', error);
            connection.status = 'error';
            this.metrics.errorCount++;
            this.metrics.lastError = error.message || 'Unknown error';
            this.updateConnectionStatus('supabase', 'error');

            this.reportIssue({
              id: `ws-supabase-error-${Date.now()}`,
              severity: 'medium',
              type: 'websocket',
              title: 'Supabase WebSocket Error',
              description: `Supabase realtime error: ${error.message || 'Unknown error'}`,
              detectedAt: new Date().toISOString()
            });

            if (connection.autoReconnect && this.isRunning) {
              this.scheduleReconnect('supabase');
            }
          });
      }

      // Check initial status
      const status = getRealtimeStatus();
      connection.status = this.mapRealtimeStatus(status);
      this.updateConnectionStatus('supabase', connection.status);

    } catch (error) {
      console.error('Failed to initialize Supabase connection:', error);
      connection.status = 'error';
      this.updateConnectionStatus('supabase', 'error');
      throw error;
    }
  }

  private async initializeTradingConnection(): Promise<void> {
    // Initialize trading WebSocket connection record
    this.connections.set('trading', {
      id: 'trading',
      type: 'trading',
      url: this.getTradingWebSocketUrl(),
      status: 'disconnected',
      reconnectAttempts: 0,
      latency: 0,
      lastPing: new Date().toISOString(),
      autoReconnect: true,
      backoffDelay: 1000
    });

    try {
      await this.createTradingWebSocket();
    } catch (error) {
      console.error('Failed to initialize trading connection:', error);
      // Don't throw here as trading WS might not be critical
    }
  }

  private async createTradingWebSocket(): Promise<void> {
    const connection = this.connections.get('trading');
    if (!connection) return;

    try {
      connection.status = 'connecting';
      this.updateConnectionStatus('trading', 'connecting');

      // For now, simulate a trading WebSocket (replace with actual implementation)
      // In a real implementation, this would connect to your trading data provider

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate connection delay

      // Simulate successful connection
      connection.status = 'connected';
      connection.connectedAt = new Date().toISOString();
      this.updateConnectionStatus('trading', 'connected');

      console.log('Trading WebSocket connected (simulated)');

    } catch (error) {
      console.error('Failed to create trading WebSocket:', error);
      connection.status = 'error';
      this.updateConnectionStatus('trading', 'error');
      throw error;
    }
  }

  private getTradingWebSocketUrl(): string {
    // This would typically be configured via environment variables
    return process.env.NEXT_PUBLIC_TRADING_WS_URL || 'wss://trading-api.zignals.org/ws';
  }

  private async getSupabaseStatus(): Promise<'connected' | 'connecting' | 'disconnected' | 'error'> {
    const connection = this.connections.get('supabase');
    if (!connection) return 'disconnected';

    // Get real-time status from Supabase client
    const realtimeStatus = getRealtimeStatus();
    return this.mapRealtimeStatus(realtimeStatus);
  }

  private getTradingStatus(): 'connected' | 'connecting' | 'disconnected' | 'error' {
    const connection = this.connections.get('trading');
    return connection?.status || 'disconnected';
  }

  private mapRealtimeStatus(status: string): 'connected' | 'connecting' | 'disconnected' | 'error' {
    switch (status.toLowerCase()) {
      case 'open':
      case 'connected':
        return 'connected';
      case 'connecting':
      case 'joining':
        return 'connecting';
      case 'closed':
      case 'disconnected':
        return 'disconnected';
      case 'error':
      case 'failed':
        return 'error';
      default:
        return 'disconnected';
    }
  }

  private startPeriodicChecks(): void {
    // Ping connections every 30 seconds
    this.pingInterval = setInterval(async () => {
      await this.pingConnections();
    }, 30000);

    // Health check every minute
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 60000);
  }

  private async pingConnections(): Promise<void> {
    for (const [id, connection] of this.connections) {
      if (connection.status === 'connected') {
        const pingStart = Date.now();

        try {
          // Perform ping based on connection type
          if (connection.type === 'supabase') {
            await this.pingSupabase();
          } else if (connection.type === 'trading') {
            await this.pingTrading();
          }

          const pingEnd = Date.now();
          connection.latency = pingEnd - pingStart;
          connection.lastPing = new Date().toISOString();

        } catch (error) {
          console.warn(`Ping failed for ${id}:`, error);
          connection.status = 'error';
          this.updateConnectionStatus(id, 'error');
        }
      }
    }
  }

  private async pingSupabase(): Promise<void> {
    if (this.supabaseClient) {
      // Simple query to test connection
      const { error } = await this.supabaseClient
        .from('user_profiles')
        .select('id')
        .limit(1);

      if (error) {
        throw error;
      }
    }
  }

  private async pingTrading(): Promise<void> {
    // For simulated trading WebSocket, just resolve
    // In real implementation, send ping frame
    return Promise.resolve();
  }

  private async performHealthCheck(): Promise<void> {
    for (const [id, connection] of this.connections) {
      // Check if connection has been inactive for too long
      const lastPingAge = Date.now() - new Date(connection.lastPing).getTime();

      if (lastPingAge > 120000) { // 2 minutes
        console.warn(`Connection ${id} appears stale, attempting reconnect`);

        if (id === 'supabase') {
          await this.reconnectSupabase();
        } else if (id === 'trading') {
          await this.reconnectTrading();
        }
      }

      // Auto-reconnect disconnected connections
      if (connection.status === 'disconnected' && connection.autoReconnect) {
        this.scheduleReconnect(id);
      }
    }
  }

  private scheduleReconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Calculate backoff delay
    const delay = Math.min(
      connection.backoffDelay * Math.pow(2, connection.reconnectAttempts),
      30000 // Max 30 seconds
    );

    console.log(`Scheduling reconnect for ${connectionId} in ${delay}ms`);

    setTimeout(async () => {
      if (!this.isRunning) return;

      if (connectionId === 'supabase') {
        await this.reconnectSupabase();
      } else if (connectionId === 'trading') {
        await this.reconnectTrading();
      }
    }, delay);
  }

  private async closeAllConnections(): Promise<void> {
    console.log('Closing all WebSocket connections...');

    // Close trading WebSocket
    if (this.tradingWs) {
      this.tradingWs.close();
      this.tradingWs = null;
    }

    // Supabase client handles its own cleanup
    // Just update connection status
    for (const connection of this.connections.values()) {
      connection.status = 'disconnected';
      connection.disconnectedAt = new Date().toISOString();
    }
  }

  private updateConnectionStatus(connectionId: string, status: 'connected' | 'connecting' | 'disconnected' | 'error'): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.status = status;
    }

    // Notify status listeners
    this.notifyStatusListeners();
  }

  private async notifyStatusListeners(): Promise<void> {
    const status = await this.getStatus();
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in WebSocket status listener:', error);
      }
    });
  }

  private reportIssue(issue: NetworkIssue): void {
    this.issueListeners.forEach(listener => {
      try {
        listener(issue);
      } catch (error) {
        console.error('Error in WebSocket issue listener:', error);
      }
    });
  }

  private updateMetrics(): void {
    const connections = Array.from(this.connections.values());

    this.metrics.totalConnections = connections.length;
    this.metrics.activeConnections = connections.filter(c => c.status === 'connected').length;

    // Calculate average latency
    const connectedConnections = connections.filter(c => c.status === 'connected' && c.latency > 0);
    if (connectedConnections.length > 0) {
      this.metrics.avgLatency = connectedConnections.reduce((sum, c) => sum + c.latency, 0) / connectedConnections.length;
    }

    // Calculate uptime percentages
    const totalTime = Date.now() - this.startTime;
    if (totalTime > 0) {
      const supabaseConnection = this.connections.get('supabase');
      const tradingConnection = this.connections.get('trading');

      if (supabaseConnection) {
        const connectedTime = supabaseConnection.connectedAt ?
          Date.now() - new Date(supabaseConnection.connectedAt).getTime() : 0;
        this.metrics.uptime.supabase = (connectedTime / totalTime) * 100;
      }

      if (tradingConnection) {
        const connectedTime = tradingConnection.connectedAt ?
          Date.now() - new Date(tradingConnection.connectedAt).getTime() : 0;
        this.metrics.uptime.trading = (connectedTime / totalTime) * 100;
      }

      this.metrics.uptime.overall = (this.metrics.uptime.supabase + this.metrics.uptime.trading) / 2;
    }
  }
}