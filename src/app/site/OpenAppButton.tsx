import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { APP_PATH } from '@/core/ui/routes';

/** Call to action that opens the focus workspace. */
export const OpenAppButton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Link
    to={APP_PATH}
    className={`inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${className}`}
  >
    Open FocusFlow
    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
  </Link>
);
