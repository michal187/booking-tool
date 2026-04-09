import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ReservationForm from '@/components/ReservationForm';

describe('ReservationForm', () => {
  it('submits normalized ISO timestamps and resets fields on success', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ success: true });
    const expectedStartAt = new Date('2026-04-10T08:00').toISOString();
    const expectedEndAt = new Date('2026-04-10T09:00').toISOString();

    render(<ReservationForm equipmentName="Vector VN1600" userId="user-001" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Od'), {
      target: { value: '2026-04-10T08:00' },
    });
    fireEvent.change(screen.getByLabelText('Do'), {
      target: { value: '2026-04-10T09:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: /złóż rezerwację/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      equipmentName: 'Vector VN1600',
      userId: 'user-001',
      startAt: expectedStartAt,
      endAt: expectedEndAt,
    });
    expect(screen.getByLabelText('Od')).toHaveValue('');
    expect(screen.getByLabelText('Do')).toHaveValue('');
  });

  it('shows a server-side error when submission fails', async () => {
    const onSubmit = vi.fn().mockResolvedValue({
      success: false,
      error: 'Konflikt z istniejącą rezerwacją.',
    });

    render(<ReservationForm equipmentName="Vector VN1600" userId="user-001" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Od'), {
      target: { value: '2026-04-10T08:00' },
    });
    fireEvent.change(screen.getByLabelText('Do'), {
      target: { value: '2026-04-10T09:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: /złóż rezerwację/i }));

    expect(await screen.findByText('Konflikt z istniejącą rezerwacją.')).toBeInTheDocument();
  });
});
