import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ToastViewport } from '../ToastViewport';
import { useToastStore } from '../useToastStore';

describe('ToastViewport', () => {
  beforeEach(() => useToastStore.setState({ toasts: [] }));

  it('renders toasts and lets the user dismiss them', () => {
    useToastStore.setState({
      toasts: [
        { id: '1', message: 'Saved', variant: 'success' },
        { id: '2', message: 'Failed', variant: 'error' },
      ],
    });
    render(<ToastViewport />);

    expect(screen.getAllByTestId('toast')).toHaveLength(2);
    expect(screen.getByText('Saved')).toBeInTheDocument();

    fireEvent.click(screen.getAllByLabelText('Dismiss notification')[0]);
    expect(useToastStore.getState().toasts.map((t) => t.id)).toEqual(['2']);
  });

  it('renders nothing visible when there are no toasts', () => {
    render(<ToastViewport />);
    expect(screen.queryByTestId('toast')).toBeNull();
  });
});
