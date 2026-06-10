import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  let displayMessage = "Something went wrong. Please try again.";
  let isPermissionError = false;

  try {
    if (error?.message) {
      const parsed = JSON.parse(error.message);
      if (parsed.error && parsed.error.includes('permission')) {
        displayMessage = "You don't have permission to perform this action. Please check your account status.";
        isPermissionError = true;
      }
    }
  } catch (e) {
    // Not a JSON error
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="bg-white dark:bg-surface p-8 rounded-3xl shadow-sm border border-stone-200 dark:border-white/5 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100 dark:border-red-500/20">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2 uppercase tracking-tight">Application Error</h2>
        <p className="text-stone-500 dark:text-stone-400 mb-8">{displayMessage}</p>
        
        <button
          onClick={() => {
            resetErrorBoundary();
            window.location.href = '/';
          }}
          className="w-full bg-stone-900 dark:bg-accent hover:bg-stone-800 dark:hover:bg-accent/80 text-white dark:text-black font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
        >
          <RefreshCcw className="w-4 h-4" />
          Reload Application
        </button>
        
        {isPermissionError && (
          <p className="mt-4 text-xs text-stone-400 dark:text-stone-500 font-medium">
            If you are an admin, ensure your email is correctly configured in the security rules.
          </p>
        )}
      </div>
    </div>
  );
}

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // reset the state of your app so the error doesn't happen again
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
