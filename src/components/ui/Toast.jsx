import { Toaster } from 'sonner';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        },
        className: 'font-sans',
      }}
      icons={{
        success: <CheckCircle className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
      }}
    />
  );
};

export default ToastProvider;