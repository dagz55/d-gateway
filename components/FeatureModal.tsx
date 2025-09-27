'use client';

import React from 'react';
import { LucideIcon, CheckCircle2, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Link from 'next/link';

export interface FeatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  subtitle: string;
  highlights: string[];
  description?: string;
  primaryAction: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  testId?: string;
}

export function FeatureModal({
  open,
  onOpenChange,
  icon: Icon,
  iconColor = '#33E1DA',
  title,
  subtitle,
  highlights,
  description,
  primaryAction,
  secondaryAction,
  testId,
}: FeatureModalProps) {
  const handlePrimaryClick = () => {
    if (primaryAction.onClick) {
      primaryAction.onClick();
    }
    if (!primaryAction.href) {
      onOpenChange(false);
    }
  };

  const handleSecondaryClick = () => {
    if (secondaryAction?.onClick) {
      secondaryAction.onClick();
    }
    if (!secondaryAction?.href) {
      onOpenChange(false);
    }
  };

  const PrimaryButton = primaryAction.href ? Link : 'button';
  const SecondaryButton = secondaryAction?.href ? Link : 'button';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        data-testid={testId}
      >
        {/* Header with icon badge */}
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center ring-1 ring-white/10"
              style={{ 
                backgroundColor: `${iconColor}15`,
                boxShadow: `0 0 24px ${iconColor}20`
              }}
            >
              <Icon 
                className="w-8 h-8" 
                style={{ color: iconColor }}
              />
            </div>
          </div>
          <div className="text-center space-y-2">
            <DialogTitle className="text-2xl font-bold text-white">
              {title}
            </DialogTitle>
            <DialogDescription className="text-base text-white/80">
              {subtitle}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Scrollable body content */}
        <div className="flex-1 overflow-y-auto py-6 px-2 -mx-2">
          <div className="space-y-6">
            {/* Description if provided */}
            {description && (
              <p className="text-white/70 text-sm leading-relaxed">
                {description}
              </p>
            )}

            {/* Highlights list */}
            <div className="space-y-3">
              {highlights.map((highlight, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-white/20"
                >
                  <CheckCircle2 
                    className="w-5 h-5 mt-0.5 flex-shrink-0" 
                    style={{ color: iconColor }}
                  />
                  <span className="text-white/90 text-sm">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>

            {/* Optional extra content area for future use */}
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-[#33E1DA]/10 to-[#1A7FB3]/10 border border-[#33E1DA]/20">
              <p className="text-xs text-white/60 text-center">
                Ready to experience the difference? Get started in seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
          {secondaryAction && (
            <SecondaryButton
              {...(secondaryAction.href ? { href: secondaryAction.href } : {})}
              onClick={handleSecondaryClick}
              className="px-6 py-2.5 text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-all hover:bg-white/10 text-sm font-medium"
            >
              {secondaryAction.label}
            </SecondaryButton>
          )}
          
          <PrimaryButton
            {...(primaryAction.href ? { href: primaryAction.href } : {})}
            onClick={handlePrimaryClick}
            className="group px-6 py-2.5 bg-gradient-to-r from-[#33E1DA] to-[#1A7FB3] text-[#0A0F1F] rounded-lg transition-all hover:shadow-lg hover:shadow-[#33E1DA]/25 hover:scale-105 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {primaryAction.label}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}