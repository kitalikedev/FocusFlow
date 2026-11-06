import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../app/App';

describe('Application Smoke Test', () => {
  it('renders App shell, Frosted Glass Capsule, default time 25:00, and HUD', () => {
    render(<App />);

    expect(screen.getByText('FocusFlow')).toBeInTheDocument();
    expect(screen.getByTestId('clock-capsule')).toBeInTheDocument();
    expect(screen.getByTestId('clock-time')).toHaveTextContent('25:00');
    expect(screen.getByTestId('control-bar')).toBeInTheDocument();
    expect(screen.getByTestId('wallpaper-layer')).toBeInTheDocument();
  });
});
