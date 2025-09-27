'use client'

/**
 * Network Status Indicator - Real-time network health display component
 *
 * This component provides:
 * - Real-time network status visualization
 * - Connection health indicators
 * - Performance metrics display
 * - Issue alerts and recommendations
 * - Manual diagnostics trigger
 */

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  Globe,
  Server,
  Timer,
  TrendingUp
} from 'lucide-react'
import { networkAgent, type NetworkStatus, type NetworkHealthReport } from '@/lib/network/network-agent'

interface NetworkStatusIndicatorProps {
  showDetails?: boolean
  className?: string
}

export function NetworkStatusIndicator({
  showDetails = false,
  className = ''
}: NetworkStatusIndicatorProps) {
  const [status, setStatus] = useState<NetworkStatus | null>(null)
  const [healthReport, setHealthReport] = useState<NetworkHealthReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribe = networkAgent.onStatusChange((newStatus) => {
      setStatus(newStatus)
    })

    // Get initial status
    const initialStatus = networkAgent.getStatus()
    setStatus(initialStatus)

    return unsubscribe
  }, [])

  const getStatusIcon = (overallStatus: string) => {
    switch (overallStatus) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'offline':
        return <WifiOff className="h-4 w-4 text-gray-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (overallStatus: string) => {
    switch (overallStatus) {
      case 'healthy': return 'bg-green-500'
      case 'degraded': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getWebSocketStatusBadge = (wsStatus: string) => {
    const variant = wsStatus === 'connected' ? 'default' :
                   wsStatus === 'connecting' ? 'secondary' : 'destructive'

    return (
      <Badge variant={variant} className="text-xs">
        {wsStatus}
      </Badge>
    )
  }

  const runDiagnostics = async () => {
    setIsLoading(true)
    try {
      await networkAgent.runDiagnostics()
      const report = networkAgent.getHealthReport()
      setHealthReport(report)
    } catch (error) {
      console.error('Error running diagnostics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatLatency = (latency: number) => {
    if (latency === 0) return 'N/A'
    return `${latency}ms`
  }

  const formatBandwidth = (bandwidth: number) => {
    if (bandwidth === 0) return 'N/A'
    return `${bandwidth} Mbps`
  }

  if (!status) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Activity className="h-4 w-4 animate-pulse text-gray-400" />
        <span className="text-sm text-gray-500">Initializing...</span>
      </div>
    )
  }

  // Simple indicator for header/minimal display
  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center space-x-2 cursor-pointer ${className}`}>
              {getStatusIcon(status.overall)}
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status.overall)}`} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-medium mb-1">Network Status: {status.overall}</div>
              <div className="text-xs space-y-1">
                <div>Supabase: {getWebSocketStatusBadge(status.websockets.supabase)}</div>
                <div>Trading: {getWebSocketStatusBadge(status.websockets.trading)}</div>
                <div>APIs: {Object.keys(status.apis).length} endpoints</div>
                <div>Latency: {formatLatency(status.diagnostics.latency)}</div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Detailed network status dashboard
  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium flex items-center space-x-2">
            {getStatusIcon(status.overall)}
            <span>Network Status</span>
          </CardTitle>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={runDiagnostics}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Activity className="h-4 w-4 animate-spin" />
                ) : (
                  <Activity className="h-4 w-4" />
                )}
                Diagnose
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Network Diagnostics Report</DialogTitle>
              </DialogHeader>
              {healthReport && (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">
                      {healthReport.metrics.uptime.overall}/100
                    </div>
                    <div className="text-sm text-gray-600">Network Health Score</div>
                    <Progress
                      value={healthReport.metrics.uptime.overall}
                      className="mt-2"
                    />
                  </div>

                  <Separator />

                  {/* Issues */}
                  {healthReport.issues.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                        Active Issues ({healthReport.issues.length})
                      </h4>
                      <div className="space-y-2">
                        {healthReport.issues.map((issue, index) => (
                          <Alert key={index}>
                            <AlertDescription>
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">{issue.title}</div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {issue.description}
                                  </div>
                                </div>
                                <Badge
                                  variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}
                                  className="ml-2"
                                >
                                  {issue.severity}
                                </Badge>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {healthReport.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                        Recommendations
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {healthReport.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Metrics */}
                  <div>
                    <h4 className="font-medium mb-3">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Average Latency</div>
                        <div className="font-medium">
                          {healthReport.metrics.performance.averageLatency.toFixed(0)}ms
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Error Rate</div>
                        <div className="font-medium">
                          {healthReport.metrics.performance.errorRate.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">WebSocket Uptime</div>
                        <div className="font-medium">
                          {healthReport.metrics.uptime.websockets.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">API Uptime</div>
                        <div className="font-medium">
                          {healthReport.metrics.uptime.apis.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall</span>
            <Badge
              variant={status.overall === 'healthy' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {status.overall}
            </Badge>
          </div>

          <Separator />

          {/* WebSocket Status */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Wifi className="h-4 w-4 mr-2" />
              WebSocket Connections
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Supabase Realtime</span>
                {getWebSocketStatusBadge(status.websockets.supabase)}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Trading Data</span>
                {getWebSocketStatusBadge(status.websockets.trading)}
              </div>
            </div>
          </div>

          {/* API Status */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Server className="h-4 w-4 mr-2" />
              API Endpoints ({Object.keys(status.apis).length})
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {Object.entries(status.apis).map(([endpoint, apiStatus]) => (
                <div key={endpoint} className="flex items-center justify-between text-xs">
                  <span className="truncate mr-2" title={endpoint}>
                    {endpoint}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Badge
                      variant={apiStatus.status === 'healthy' ? 'default' : 'secondary'}
                      className="text-xs px-1"
                    >
                      {apiStatus.status}
                    </Badge>
                    <span className="text-gray-500 w-12 text-right">
                      {formatLatency(apiStatus.latency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Network Diagnostics */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Network Health
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Timer className="h-3 w-3" />
                <span>Latency: {formatLatency(status.diagnostics.latency)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-3 w-3" />
                <span>Speed: {formatBandwidth(status.diagnostics.bandwidth)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3" />
                <span>DNS: {status.diagnostics.dns ? 'OK' : 'Error'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-3 w-3" />
                <span>Internet: {status.diagnostics.connectivity ? 'OK' : 'Error'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}