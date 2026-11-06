import React from 'react';

export const FocusIntent: React.FC = () => {
  return React.createElement(
    'div',
    { 'data-testid': 'focus-intent', className: 'w-full max-w-md mx-auto text-center' },
    React.createElement('input', {
      type: 'text',
      placeholder: 'What is your focus intent?',
      className:
        'w-full bg-transparent border-b text-center text-sm px-4 py-2 focus:outline-none transition-colors',
      style: {
        borderColor: 'var(--capsule-border-color)',
        color: 'var(--color-accent)',
      },
      readOnly: true,
    })
  );
};

export const DesktopSidePanels: React.FC = () => {
  return null;
};

export const MobileDrawerTabs: React.FC = () => {
  return null;
};
