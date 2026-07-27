import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoteVault } from '../context/VoteVaultContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useVoteVault();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-[#6FCF97]" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-[#F2C94C]" />;
      case 'error': return <XCircle className="w-5 h-5 text-[#EB5757]" />;
      default: return <Info className="w-5 h-5 text-[#C9C9C9]" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-center justify-between p-4 rounded-xl bg-[#1E1E21] border border-white/10 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center space-x-3">
              {getIcon(toast.type)}
              <span className="text-sm font-medium text-[#F5F5F5]">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#8E8E93] hover:text-[#F5F5F5] transition-colors p-1"
              aria-label="Close Toast"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
