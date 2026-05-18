import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OnboardingStep4 from '../pages/OnboardingStep4';

const renderStep4 = () => {
  return render(
    <MemoryRouter initialEntries={['/onboarding/4']}>
      <OnboardingStep4 />
    </MemoryRouter>
  );
};

describe('OnboardingStep4 Page', () => {
  it('renders tanpa error', () => {
    renderStep4();
  });

  it('menampilkan indikator langkah 4 dari 5', () => {
    renderStep4();
    expect(screen.getByText('Langkah 4')).toBeInTheDocument();
  });

  it('menampilkan judul Target Berat Badan', () => {
    renderStep4();
    expect(screen.getByText('Target Berat Badan')).toBeInTheDocument();
  });

  it('menampilkan deskripsi target', () => {
    renderStep4();
    expect(screen.getByText(/Tentukan target berat badan ideal/i)).toBeInTheDocument();
  });

  it('menampilkan tombol Kembali', () => {
    renderStep4();
    expect(screen.getByText('Kembali')).toBeInTheDocument();
  });

  it('tombol Kembali dapat diklik', () => {
    renderStep4();
    fireEvent.click(screen.getByText('Kembali'));
  });

  it('menampilkan label Target Berat', () => {
    renderStep4();
    expect(screen.getByText('Target Berat')).toBeInTheDocument();
  });

  it('menampilkan nilai target berat default 65 kg', () => {
    renderStep4();
    // Ada beberapa teks "65" - di heading dan di kartu stats
    const elements = screen.getAllByText(/65/);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('menampilkan slider target berat', () => {
    renderStep4();
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('min', '30');
    expect(slider).toHaveAttribute('max', '150');
  });

  it('slider dapat diubah nilainya', () => {
    renderStep4();
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '60' } });
  });

  it('menampilkan range slider 30 kg dan 150 kg', () => {
    renderStep4();
    expect(screen.getByText('30 kg')).toBeInTheDocument();
    expect(screen.getByText('150 kg')).toBeInTheDocument();
  });

  it('menampilkan stats Saat Ini, Target, Perlu', () => {
    renderStep4();
    expect(screen.getByText('Saat Ini')).toBeInTheDocument();
    expect(screen.getByText('Target')).toBeInTheDocument();
    expect(screen.getByText('Perlu')).toBeInTheDocument();
  });

  it('menampilkan berat saat ini 70 kg', () => {
    renderStep4();
    expect(screen.getByText('70 kg')).toBeInTheDocument();
  });

  it('menampilkan kotak info tentang target sehat', () => {
    renderStep4();
    expect(screen.getByText(/Target penurunan berat badan yang sehat/i)).toBeInTheDocument();
  });

  it('menampilkan tombol Lanjutkan', () => {
    renderStep4();
    expect(screen.getByText('Lanjutkan')).toBeInTheDocument();
  });

  it('tombol Lanjutkan dapat diklik', () => {
    renderStep4();
    fireEvent.click(screen.getByText('Lanjutkan'));
  });

  it('nilai Perlu berubah ketika slider diubah', () => {
    renderStep4();
    const slider = screen.getByRole('slider');
    // Default 65, berat saat ini 70, jadi perlu 5 kg
    expect(screen.getByText('5 kg')).toBeInTheDocument();
    // Ubah ke 80
    fireEvent.change(slider, { target: { value: '80' } });
    // Sekarang perlu 10 kg lebih
    expect(screen.getByText('10 kg')).toBeInTheDocument();
  });
});
