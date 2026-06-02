import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeightReminderBanner from '../components/WeightReminderBanner';

const renderBanner = (overrides = {}) => {
  const props = {
    show: true,
    onCatat: vi.fn(),
    onDismiss: vi.fn(),
    ...overrides,
  };
  return { ...render(<WeightReminderBanner {...props} />), props };
};

describe('WeightReminderBanner Component', () => {
  it('renders tanpa error saat show true', () => {
    renderBanner();
  });

  it('tidak merender apapun saat show false', () => {
    const { container } = render(
      <WeightReminderBanner show={false} onCatat={vi.fn()} onDismiss={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('menampilkan pesan pengingat berat badan', () => {
    renderBanner();
    expect(
      screen.getByText(/Jangan lupa catat berat badan hari ini/i)
    ).toBeInTheDocument();
  });

  it('menampilkan deskripsi manfaat pencatatan rutin', () => {
    renderBanner();
    expect(
      screen.getByText(/Pencatatan rutin membantu kamu memantau progres/i)
    ).toBeInTheDocument();
  });

  it('menampilkan tombol Catat Sekarang', () => {
    renderBanner();
    expect(screen.getByText('Catat Sekarang')).toBeInTheDocument();
  });

  it('memanggil onCatat saat tombol Catat Sekarang diklik', () => {
    const { props } = renderBanner();
    fireEvent.click(screen.getByText('Catat Sekarang'));
    expect(props.onCatat).toHaveBeenCalledTimes(1);
  });

  it('menampilkan tombol tutup pengingat', () => {
    renderBanner();
    expect(
      screen.getByRole('button', { name: /Tutup pengingat/i })
    ).toBeInTheDocument();
  });

  it('memanggil onDismiss saat tombol tutup diklik', () => {
    const { props } = renderBanner();
    fireEvent.click(screen.getByRole('button', { name: /Tutup pengingat/i }));
    expect(props.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('memiliki role alert', () => {
    renderBanner();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('tidak memanggil onCatat saat show false', () => {
    const onCatat = vi.fn();
    render(
      <WeightReminderBanner show={false} onCatat={onCatat} onDismiss={vi.fn()} />
    );
    expect(onCatat).not.toHaveBeenCalled();
  });
});
