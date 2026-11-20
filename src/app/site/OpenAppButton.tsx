import React from 'react';
import { Link } from 'react-router-dom';
import { APP_PATH } from '@/core/ui/routes';
import { SITE_BUTTON_PRIMARY } from '@/core/ui/siteStyles';

/** Call to action that opens the focus workspace. */
export const OpenAppButton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Link to={APP_PATH} className={`${SITE_BUTTON_PRIMARY} ${className}`}>
    Open FocusFlow
  </Link>
);
