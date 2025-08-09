import React from 'react';

interface LoadingSpinnerProps {
  progress: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ progress }) => {
  return (
    <div className="mb-12">
      <div className="max-w-md mx-auto space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-emerald-400">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-200"></div>
          </div>
          <p className="mt-2 text-sm text-slate-300">Analyse en cours...</p>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};