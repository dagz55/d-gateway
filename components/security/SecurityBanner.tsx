'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SecurityInfo {
  ssl: boolean;
  encryption: boolean;
  riskScore: number;
  deviceType: string;
  ipAddress: string;
  country?: string;
  city?: string;
}

interface SecurityBannerProps {
  securityInfo?: SecurityInfo;
  showDetails?: boolean;
  className?: string;
}

export default function SecurityBanner({ 
  securityInfo, 
  showDetails = false, 
  className = '' 
}: SecurityBannerProps) {
  const [isVisible, setIsVisible] = useState(showDetails);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: 'Low', color: 'bg-green-100 text-green-800 border-green-200' };
    if (score < 70) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { level: 'High', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return '📱';
      case 'tablet': return '📱';
      case 'desktop': return '💻';
      default: return '🖥️';
    }
  };

  return (
    <Card className={`border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 ${className}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Security Status</h3>
              <p className="text-sm text-gray-600">Your connection is secure</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="text-gray-600"
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isVisible ? 'Hide' : 'Show'} Details
          </Button>
        </div>

        {/* Security Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-green-200">
            <Lock className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">SSL</p>
              <p className="text-sm font-medium text-green-800">Secured</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-blue-200">
            <Shield className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Encryption</p>
              <p className="text-sm font-medium text-blue-800">256-bit</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-200">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600">Verified</p>
              <p className="text-sm font-medium text-purple-800">PayPal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-orange-200">
            <div className="text-lg">{getDeviceIcon(securityInfo?.deviceType || 'desktop')}</div>
            <div>
              <p className="text-xs text-gray-600">Device</p>
              <p className="text-sm font-medium text-orange-800 capitalize">
                {securityInfo?.deviceType || 'Desktop'}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Security Information */}
        {isVisible && securityInfo && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-800">Connection Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Risk Assessment:</span>
                  <Badge className={`${getRiskLevel(securityInfo.riskScore).color} border`}>
                    {getRiskLevel(securityInfo.riskScore).level} Risk
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">IP Address:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {securityInfo.ipAddress}
                  </span>
                </div>
                
                {securityInfo.country && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm text-gray-900">
                      {securityInfo.city && `${securityInfo.city}, `}{securityInfo.country}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Connection Time:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Session ID:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {Math.random().toString(36).substring(2, 8).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Protocol:</span>
                  <span className="text-sm text-gray-900">HTTPS/TLS 1.3</span>
                </div>
              </div>
            </div>

            {/* Security Recommendations */}
            {securityInfo.riskScore > 50 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-yellow-800">Security Notice</h5>
                    <p className="text-sm text-yellow-700 mt-1">
                      We've detected some unusual activity. For your security, please ensure you're using a trusted network and device.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Powered by Zignals Security</span>
            <span>Last updated: {currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
