'use client';

import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

interface GlobalLoadingOverlayProps {
  isLoading: boolean;
  loadingText?: string;
}

export default function GlobalLoadingOverlay({ 
  isLoading, 
  loadingText = 'Loading...' 
}: GlobalLoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#040918]/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <LoadingSpinner size="lg" text={loadingText} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
