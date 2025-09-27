'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Default to collapsed for better space utilization
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      setIsCollapsed,
      isMobileOpen,
      setIsMobileOpen
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
