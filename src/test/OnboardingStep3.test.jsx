import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OnboardingStep3 from '../pages/OnboardingStep3';

const renderStep3 = () => {
  return render(
    <MemoryRouter initialEntries={['/onboarding/3']}>
      <OnboardingStep3 />
    </MemoryRouter>
  );
};

describe('OnboardingStep3 Page', () => {
  it('renders tanpa error', () => {
    renderStep3();
  });

  it('menampilkan indikator langkah 3 dari 5', () => {
    renderStep3();
    expect(screen.getByText('Langkah 3')).toBeInTheDocument();
  });

  it('menampilkan judul Hasil BMI Anda', () => {
    renderStep3();
    expect(screen.getByText('Hasil BMI Anda')).toBeInTheDocument();
  });

  it('menampilkan deskripsi BMI', () => {
    renderStep3();
    expect(screen.getByText(/Berdasarkan data yang Anda masukkan/i)).toBeInTheDocument();
  });

  it('menampilkan tombol Kembali', () => {
    renderStep3();
    expect(screen.getByText('Kembali')).toBeInTheDocument();
  });

  it('tombol Kembali dapat diklik', () => {
    renderStep3();
    fireEvent.click(screen.getByText('Kembali'));
  });

  it('menampilkan label BMI Score', () => {
    renderStep3();
    expect(screen.getByText('BMI Score')).toBeInTheDocument();
  });

  it('menampilkan nilai BMI 24.2', () => {
    renderStep3();
    expect(screen.getByText('24.2')).toBeInTheDocument();
  });

  it('menampilkan kategori BMI Normal', () => {
    renderStep3();
    // Normal muncul dua kali: di badge kategori dan di legenda
    expect(screen.getAllByText('Normal').length).toBeGreaterThanOrEqual(1);
  });

  it('menampilkan legenda BMI (Kurus, Normal, Berlebihan, Obesitas)', () => {
    renderStep3();
    expect(screen.getByText('Kurus')).toBeInTheDocument();
    // Normal muncul dua kali: sebagai kategori BMI dan sebagai label legenda
    expect(screen.getAllByText('Normal').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Berlebihan')).toBeInTheDocument();
    expect(screen.getByText('Obesitas')).toBeInTheDocument();
  });

  it('menampilkan info Berat Ideal', () => {
    renderStep3();
    expect(screen.getByText('Berat Ideal')).toBeInTheDocument();
    expect(screen.getByText('58 - 71 kg')).toBeInTheDocument();
  });

  it('menampilkan info Tinggi', () => {
    renderStep3();
    expect(screen.getByText('Tinggi')).toBeInTheDocument();
    expect(screen.getByText('170 cm')).toBeInTheDocument();
  });

  it('menampilkan tombol Lanjutkan', () => {
    renderStep3();
    expect(screen.getByText('Lanjutkan')).toBeInTheDocument();
  });

  it('tombol Lanjutkan dapat diklik', () => {
    renderStep3();
    fireEvent.click(screen.getByText('Lanjutkan'));
  });
});
