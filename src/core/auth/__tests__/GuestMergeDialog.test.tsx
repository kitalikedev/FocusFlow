import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { GuestMergeDialog } from '../GuestMergeDialog';
import { useAuthStore } from '../useAuthStore';

vi.mock('@/shared/lib/supabase');

describe('GuestMergeDialog (AC-02.3)', () => {
  const resolve = vi.fn();

  beforeEach(() => {
    resolve.mockReset().mockResolvedValue(undefined);
    useAuthStore.setState({ mergePrompt: 'open', resolveGuestMerge: resolve });
  });

  it('renders nothing when the prompt is hidden', () => {
    useAuthStore.setState({ mergePrompt: 'hidden' });
    const { container } = render(<GuestMergeDialog />);
    expect(container.firstChild).toBeNull();
  });

  it('asks the exact question required by the acceptance criteria', () => {
    render(<GuestMergeDialog />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(
      screen.getByText('Bạn có muốn nhập dữ liệu từ phiên khách vào tài khoản này không?'),
    ).toBeInTheDocument();
  });

  it('merges when the user agrees', () => {
    render(<GuestMergeDialog />);
    fireEvent.click(screen.getByRole('button', { name: 'Đồng ý' }));
    expect(resolve).toHaveBeenCalledWith('merge');
  });

  it('discards when the user declines', () => {
    render(<GuestMergeDialog />);
    fireEvent.click(screen.getByRole('button', { name: 'Từ chối' }));
    expect(resolve).toHaveBeenCalledWith('discard');
  });

  it('locks both buttons while the merge is running', () => {
    useAuthStore.setState({ mergePrompt: 'running' });
    render(<GuestMergeDialog />);
    expect(screen.getByRole('button', { name: 'Đồng ý' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Từ chối' })).toBeDisabled();
  });
});
