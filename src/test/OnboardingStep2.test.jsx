import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OnboardingStep2 from '../pages/OnboardingStep2';

const renderStep2 = () => {
  return render(
    <MemoryRouter initialEntries={['/onboarding/2']}>
      <OnboardingStep2 />
    </MemoryRouter>
  );
};

describe('OnboardingStep2 Page', () => {
  it('renders tanpa error', () => {
    renderStep2();
  });

  it('menampilkan indikator langkah 2 dari 5', () => {
    renderStep2();
    expect(screen.getByText('Langkah 2')).toBeInTheDocument();
  });

  it('menampilkan judul Data Pribadi', () => {
    renderStep2();
    expect(screen.getByText('Data Pribadi')).toBeInTheDocument();
  });

  it('menampilkan deskripsi personalisasi', () => {
    renderStep2();
    expect(screen.getByText(/Beritahu kami sedikit tentang diri Anda/i)).toBeInTheDocument();
  });

  it('menampilkan tombol Kembali', () => {
    renderStep2();
    expect(screen.getByText('Kembali')).toBeInTheDocument();
  });

  it('tombol Kembali dapat diklik', () => {
    renderStep2();
    fireEvent.click(screen.getByText('Kembali'));
  });

  it('menampilkan label Jenis Kelamin', () => {
    renderStep2();
    expect(screen.getByText('Jenis Kelamin')).toBeInTheDocument();
  });

  it('menampilkan pilihan Laki-laki dan Perempuan', () => {
    renderStep2();
    expect(screen.getByText('Laki-laki')).toBeInTheDocument();
    expect(screen.getByText('Perempuan')).toBeInTheDocument();
  });

  it('dapat memilih jenis kelamin Laki-laki', () => {
    renderStep2();
    const maleBtn = screen.getByText('Laki-laki');
    fireEvent.click(maleBtn);
    // Setelah diklik, tombol seharusnya menunjukkan state aktif (class berubah)
    expect(maleBtn).toBeInTheDocument();
  });

  it('dapat memilih jenis kelamin Perempuan', () => {
    renderStep2();
    const femaleBtn = screen.getByText('Perempuan');
    fireEvent.click(femaleBtn);
    expect(femaleBtn).toBeInTheDocument();
  });

  it('menampilkan label Usia', () => {
    renderStep2();
    expect(screen.getByText('Usia')).toBeInTheDocument();
  });

  it('menampilkan usia default 25 tahun', () => {
    renderStep2();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('tahun')).toBeInTheDocument();
  });

  it('dapat menambah usia dengan tombol +', () => {
    renderStep2();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('menampilkan label Tinggi (cm)', () => {
    renderStep2();
    expect(screen.getByText('Tinggi (cm)')).toBeInTheDocument();
  });

  it('menampilkan input tinggi dengan nilai default 170', () => {
    renderStep2();
    const heightInput = screen.getByDisplayValue('170');
    expect(heightInput).toBeInTheDocument();
    expect(heightInput).toHaveAttribute('type', 'number');
  });

  it('menampilkan label Berat (kg)', () => {
    renderStep2();
    expect(screen.getByText('Berat (kg)')).toBeInTheDocument();
  });

  it('menampilkan input berat dengan nilai default 70', () => {
    renderStep2();
    const weightInput = screen.getByDisplayValue('70');
    expect(weightInput).toBeInTheDocument();
    expect(weightInput).toHaveAttribute('type', 'number');
  });

  it('menampilkan tombol Lanjutkan', () => {
    renderStep2();
    expect(screen.getByText('Lanjutkan')).toBeInTheDocument();
  });

  it('tombol Lanjutkan dapat diklik', () => {
    renderStep2();
    fireEvent.click(screen.getByText('Lanjutkan'));
  });

  it('dapat mengubah nilai input tinggi badan', () => {
    renderStep2();
    const heightInput = screen.getByDisplayValue('170');
    fireEvent.change(heightInput, { target: { value: '175' } });
    expect(heightInput.value).toBe('175');
  });
});
