import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OnboardingStep1 from '../pages/OnboardingStep1';

const renderStep1 = () => {
  return render(
    <MemoryRouter initialEntries={['/onboarding/1']}>
      <OnboardingStep1 />
    </MemoryRouter>
  );
};

describe('OnboardingStep1 Page', () => {
  it('renders tanpa error', () => {
    renderStep1();
  });

  it('menampilkan indikator langkah 1 dari 5', () => {
    renderStep1();
    expect(screen.getByText('Langkah 1')).toBeInTheDocument();
  });

  it('menampilkan judul Buat Akun Anda', () => {
    renderStep1();
    expect(screen.getByText('Buat Akun Anda')).toBeInTheDocument();
  });

  it('menampilkan deskripsi onboarding', () => {
    renderStep1();
    expect(screen.getByText(/Mulai perjalanan kesehatan Anda/i)).toBeInTheDocument();
  });

  it('menampilkan label Nama Lengkap', () => {
    renderStep1();
    expect(screen.getByText('Nama Lengkap')).toBeInTheDocument();
  });

  it('menampilkan input Nama Lengkap', () => {
    renderStep1();
    expect(screen.getByPlaceholderText('Masukkan nama lengkap Anda')).toBeInTheDocument();
  });

  it('menampilkan label Email', () => {
    renderStep1();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('menampilkan input Email dengan type email', () => {
    renderStep1();
    const emailInput = screen.getByPlaceholderText('nama@email.com');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('menampilkan label Password', () => {
    renderStep1();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('menampilkan input Password dengan type password', () => {
    renderStep1();
    const passwordInput = screen.getByPlaceholderText('Minimal 8 karakter');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('menampilkan tombol Lanjutkan', () => {
    renderStep1();
    expect(screen.getByText('Lanjutkan')).toBeInTheDocument();
  });

  it('menampilkan link Masuk untuk pengguna yang sudah punya akun', () => {
    renderStep1();
    expect(screen.getByText('Sudah punya akun?')).toBeInTheDocument();
    expect(screen.getByText('Masuk')).toBeInTheDocument();
  });

  it('dapat mengetik di input Nama Lengkap', () => {
    renderStep1();
    const input = screen.getByPlaceholderText('Masukkan nama lengkap Anda');
    fireEvent.change(input, { target: { value: 'John Doe' } });
    expect(input.value).toBe('John Doe');
  });

  it('dapat mengetik di input Email', () => {
    renderStep1();
    const input = screen.getByPlaceholderText('nama@email.com');
    fireEvent.change(input, { target: { value: 'john@example.com' } });
    expect(input.value).toBe('john@example.com');
  });

  it('tombol Lanjutkan dapat diklik', () => {
    renderStep1();
    const lanjutkan = screen.getByText('Lanjutkan');
    fireEvent.click(lanjutkan);
  });
});
