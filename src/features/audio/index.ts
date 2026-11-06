import React from 'react';

export const ControlBar: React.FC = () => {
  return React.createElement(
    'footer',
    {
      'data-testid': 'control-bar',
      className: 'flex items-center justify-between px-6 py-3 border-t',
      style: {
        backgroundColor: 'var(--capsule-bg)',
        borderColor: 'var(--capsule-border-color)',
        backdropFilter: 'blur(var(--capsule-blur))',
        WebkitBackdropFilter: 'blur(var(--capsule-blur))',
      },
    },
    React.createElement('div', { className: 'text-xs text-zinc-400' }, 'Audio Synth Ready'),
    React.createElement('div', { className: 'text-xs text-zinc-500' }, 'Press M to Mute')
  );
};
