'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Accessibility, Eye, EyeOff, Volume2, VolumeX, Type, 
  Contrast, ZoomIn, ZoomOut, RotateCcw, Settings,
  CheckCircle, AlertTriangle, Info, HelpCircle
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  colorBlindFriendly: boolean;
  fontSize: number;
  zoomLevel: number;
}

interface AccessibilityEnhancerProps {
  className?: string;
}

export default function AccessibilityEnhancer({ className = '' }: AccessibilityEnhancerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
    colorBlindFriendly: false,
    fontSize: 16,
    zoomLevel: 100,
  });
  
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const announcementRef = useRef<HTMLDivElement>(null);

  // Apply accessibility settings to the document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Color blind friendly
    if (settings.colorBlindFriendly) {
      root.classList.add('color-blind-friendly');
    } else {
      root.classList.remove('color-blind-friendly');
    }
    
    // Font size
    root.style.fontSize = `${settings.fontSize}px`;
    
    // Zoom level
    root.style.zoom = `${settings.zoomLevel}%`;
    
    // Focus indicators
    if (settings.focusIndicators) {
      root.classList.add('focus-indicators');
    } else {
      root.classList.remove('focus-indicators');
    }
    
  }, [settings]);

  // Screen reader announcements
  const announce = (message: string) => {
    setAnnouncements(prev => [...prev, message]);
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 5000);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip to main content
      if (e.key === 'Tab' && e.shiftKey && e.ctrlKey) {
        e.preventDefault();
        const main = document.querySelector('main') || document.querySelector('[role="main"]');
        if (main) {
          (main as HTMLElement).focus();
          announce(t('skipToContent'));
        }
      }
      
      // Toggle accessibility panel
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        announce(t('closeDialog'));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardNavigation, isOpen, t]);

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    announce(`${key} ${value ? 'enabled' : 'disabled'}`);
  };

  const resetSettings = () => {
    setSettings({
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      focusIndicators: true,
      colorBlindFriendly: false,
      fontSize: 16,
      zoomLevel: 100,
    });
    announce('Accessibility settings reset');
  };

  const increaseFontSize = () => {
    if (settings.fontSize < 24) {
      updateSetting('fontSize', settings.fontSize + 2);
    }
  };

  const decreaseFontSize = () => {
    if (settings.fontSize > 12) {
      updateSetting('fontSize', settings.fontSize - 2);
    }
  };

  const increaseZoom = () => {
    if (settings.zoomLevel < 200) {
      updateSetting('zoomLevel', settings.zoomLevel + 10);
    }
  };

  const decreaseZoom = () => {
    if (settings.zoomLevel > 50) {
      updateSetting('zoomLevel', settings.zoomLevel - 10);
    }
  };

  return (
    <>
      {/* Accessibility Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg ${
          isOpen ? 'bg-blue-700' : ''
        }`}
        aria-label={t('ariaButton')}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
      >
        <Accessibility className="h-6 w-6" />
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <Card 
          id="accessibility-panel"
          className={`fixed bottom-20 right-4 z-50 w-80 max-h-96 overflow-y-auto shadow-xl ${className}`}
          role="dialog"
          aria-labelledby="accessibility-title"
          aria-describedby="accessibility-description"
        >
          <CardHeader className="pb-3">
            <CardTitle id="accessibility-title" className="flex items-center gap-2 text-lg">
              <Accessibility className="h-5 w-5" />
              Accessibility Settings
            </CardTitle>
            <CardDescription id="accessibility-description">
              Customize your experience for better accessibility
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Visual Settings */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-800">Visual Settings</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Contrast className="h-4 w-4" />
                  <span className="text-sm">High Contrast</span>
                </div>
                <Button
                  variant={settings.highContrast ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('highContrast', !settings.highContrast)}
                  aria-pressed={settings.highContrast}
                >
                  {settings.highContrast ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  <span className="text-sm">Large Text</span>
                </div>
                <Button
                  variant={settings.largeText ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('largeText', !settings.largeText)}
                  aria-pressed={settings.largeText}
                >
                  {settings.largeText ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Contrast className="h-4 w-4" />
                  <span className="text-sm">Color Blind Friendly</span>
                </div>
                <Button
                  variant={settings.colorBlindFriendly ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('colorBlindFriendly', !settings.colorBlindFriendly)}
                  aria-pressed={settings.colorBlindFriendly}
                >
                  {settings.colorBlindFriendly ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Font Size Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Font Size</span>
                <span className="text-sm text-gray-600">{settings.fontSize}px</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decreaseFontSize}
                  disabled={settings.fontSize <= 12}
                  aria-label="Decrease font size"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-600 rounded-full transition-all duration-200"
                    style={{ width: `${((settings.fontSize - 12) / 12) * 100}%` }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={increaseFontSize}
                  disabled={settings.fontSize >= 24}
                  aria-label="Increase font size"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Zoom Level</span>
                <span className="text-sm text-gray-600">{settings.zoomLevel}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decreaseZoom}
                  disabled={settings.zoomLevel <= 50}
                  aria-label="Decrease zoom"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-green-600 rounded-full transition-all duration-200"
                    style={{ width: `${((settings.zoomLevel - 50) / 150) * 100}%` }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={increaseZoom}
                  disabled={settings.zoomLevel >= 200}
                  aria-label="Increase zoom"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Interaction Settings */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-800">Interaction Settings</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Focus Indicators</span>
                </div>
                <Button
                  variant={settings.focusIndicators ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('focusIndicators', !settings.focusIndicators)}
                  aria-pressed={settings.focusIndicators}
                >
                  {settings.focusIndicators ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <span className="text-sm">Screen Reader</span>
                </div>
                <Button
                  variant={settings.screenReader ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('screenReader', !settings.screenReader)}
                  aria-pressed={settings.screenReader}
                >
                  {settings.screenReader ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={resetSettings}
                className="w-full"
                aria-label="Reset all accessibility settings"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Screen Reader Announcements */}
      <div
        ref={announcementRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>

      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
        onClick={(e) => {
          e.preventDefault();
          const main = document.querySelector('main') || document.querySelector('[role="main"]');
          if (main) {
            (main as HTMLElement).focus();
            announce(t('skipToContent'));
          }
        }}
      >
        {t('skipToContent')}
      </a>

      {/* Global CSS for accessibility features */}
      <style jsx global>{`
        .high-contrast {
          --background: #000000;
          --foreground: #ffffff;
          --primary: #ffffff;
          --primary-foreground: #000000;
          --secondary: #333333;
          --secondary-foreground: #ffffff;
          --muted: #222222;
          --muted-foreground: #cccccc;
          --accent: #ffffff;
          --accent-foreground: #000000;
          --destructive: #ff0000;
          --destructive-foreground: #ffffff;
          --border: #666666;
          --input: #333333;
          --ring: #ffffff;
        }
        
        .large-text {
          font-size: 1.2em;
        }
        
        .large-text h1 { font-size: 2.5em; }
        .large-text h2 { font-size: 2em; }
        .large-text h3 { font-size: 1.75em; }
        .large-text h4 { font-size: 1.5em; }
        .large-text h5 { font-size: 1.25em; }
        .large-text h6 { font-size: 1.1em; }
        
        .reduced-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .color-blind-friendly {
          --primary: #0066cc;
          --secondary: #ff6600;
          --accent: #00cc66;
          --destructive: #cc0000;
        }
        
        .focus-indicators *:focus {
          outline: 3px solid #0066cc !important;
          outline-offset: 2px !important;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        .focus\\:not-sr-only:focus {
          position: static;
          width: auto;
          height: auto;
          padding: 0.5rem 1rem;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
      `}</style>
    </>
  );
}
