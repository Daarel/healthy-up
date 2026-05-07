import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OnboardingStep5 from './OnboardingStep5';

const renderStep5 = () => {
  return render(
    <MemoryRouter initialEntries={['/onboarding/5']}>
      <OnboardingStep5 />
    </MemoryRouter>
  );
};

describe('OnboardingStep5 Page', () => {
  it('renders tanpa error', () => {
    renderStep5();
  });

  it('menampilkan indikator langkah 5 dari 5', () => {
    renderStep5();
    expect(screen.getByText('Langkah 5')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('menampilkan judul Ringkasan Rencana AI', () => {
    renderStep5();
    expect(screen.getByText('Ringkasan Rencana AI')).toBeInTheDocument();
  });

  it('menampilkan deskripsi ringkasan', () => {
    renderStep5();
    expect(screen.getByText(/Berdasarkan data Anda/i)).toBeInTheDocument();
  });

  it('menampilkan tombol Kembali', () => {
    renderStep5();
    expect(screen.getByText('Kembali')).toBeInTheDocument();
  });

  it('tombol Kembali dapat diklik', () => {
    renderStep5();
    fireEvent.click(screen.getByText('Kembali'));
  });

  it('menampilkan kartu Kalori Harian', () => {
    renderStep5();
    expect(screen.getByText('Kalori Harian')).toBeInTheDocument();
    expect(screen.getByText('1,800 kkal')).toBeInTheDocument();
  });

  it('menampilkan kartu Olahraga', () => {
    renderStep5();
    expect(screen.getByText('Olahraga')).toBeInTheDocument();
    expect(screen.getByText('4x per minggu')).toBeInTheDocument();
  });

  it('menampilkan kartu Estimasi Waktu', () => {
    renderStep5();
    expect(screen.getByText('Estimasi Waktu')).toBeInTheDocument();
    expect(screen.getByText('12 minggu')).toBeInTheDocument();
  });

  it('menampilkan tombol Mulai Perjalanan', () => {
    renderStep5();
    expect(screen.getByText('Mulai Perjalanan')).toBeInTheDocument();
  });

  it('tombol Mulai Perjalanan dapat diklik', () => {
    renderStep5();
    fireEvent.click(screen.getByText('Mulai Perjalanan'));
  });
});
