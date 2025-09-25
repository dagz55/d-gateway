"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TradingPanelContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

const TradingPanelContext = createContext<TradingPanelContextType | undefined>(undefined);

export function TradingPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(prev => !prev);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  const value: TradingPanelContextType = {
    isOpen,
    setIsOpen,
    toggle,
    close,
    open,
  };

  return (
    <TradingPanelContext.Provider value={value}>
      {children}
    </TradingPanelContext.Provider>
  );
}

export function useTradingPanel(): TradingPanelContextType {
  const context = useContext(TradingPanelContext);
  if (!context) {
    throw new Error('useTradingPanel must be used within a TradingPanelProvider');
  }
  return context;
}