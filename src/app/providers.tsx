import React, { useEffect } from 'react';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { applyTheme } from '@/core/theme/applyTheme';

export interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const tokens = useThemeStore((state) => state.tokens);

  useEffect(() => {
    applyTheme(tokens);
  }, [tokens]);

  return <>{children}</>;
};
