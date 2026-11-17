import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Info, ListChecks, Timer } from 'lucide-react';
import { useUiStore } from '@/core/ui/useUiStore';

const LINKS = [
  { to: '/', label: 'Workspace', Icon: Timer, end: true },
  { to: '/tasks', label: 'Tasks', Icon: ListChecks, end: false },
  { to: '/analytics', label: 'Analytics', Icon: BarChart3, end: false },
  { to: '/about', label: 'About', Icon: Info, end: false },
];

/** Main navigation between the pages; hidden in Zen mode like the rest of the chrome. */
export const PageNav: React.FC = () => {
  const isZen = useUiStore((state) => state.isZen);
  if (isZen) return null;

  return (
    <nav data-testid="page-nav" aria-label="Pages" className="flex justify-center px-4">
      <ul
        className="flex items-center gap-1 rounded-2xl border p-1"
        style={{
          backgroundColor: 'var(--capsule-bg)',
          backdropFilter: 'blur(var(--capsule-blur))',
          WebkitBackdropFilter: 'blur(var(--capsule-blur))',
          borderColor: 'var(--capsule-border-color)',
        }}
      >
        {LINKS.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                  isActive ? 'bg-accent text-accent-contrast' : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
