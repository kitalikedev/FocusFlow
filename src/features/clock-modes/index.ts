import React from 'react';

export const ClockDisplay: React.FC = () => {
  return React.createElement(
    'div',
    {
      'data-testid': 'clock-capsule',
      className: 'flex items-center justify-center px-10 py-6 select-none',
      style: {
        backgroundColor: 'var(--capsule-bg)',
        backdropFilter: 'blur(var(--capsule-blur))',
        WebkitBackdropFilter: 'blur(var(--capsule-blur))',
        borderRadius: 'var(--capsule-radius)',
        borderWidth: 'var(--capsule-border-width)',
        borderColor: 'var(--capsule-border-color)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      },
    },
    React.createElement(
      'span',
      {
        'data-testid': 'clock-time',
        className: 'text-7xl font-semibold tracking-tighter',
        style: {
          color: 'var(--color-accent)',
          fontFamily: 'var(--font-clock)',
        },
      },
      '25:00'
    )
  );
};

export const ClockSettingsPopover: React.FC = () => {
  return null;
};
