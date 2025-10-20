'use client';

import { Suspense } from 'react';

interface SearchParamsWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SearchParamsWrapper({ children, fallback }: SearchParamsWrapperProps) {
  return (
    <Suspense fallback={
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] flex items-center justify-center">
          <div className="text-cyan-400 text-xl">Cargando...</div>
        </div>
      )
    }>
      {children}
    </Suspense>
  );
}