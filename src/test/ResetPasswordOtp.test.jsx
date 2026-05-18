import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResetPasswordOtp from '../pages/ResetPasswordOtp';

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/reset-password/otp']}>
      <ResetPasswordOtp />
    </MemoryRouter>
  );

const fillOtp = (code) => {
  const inputs = screen.getAllByRole('textbox');
  code.split('').forEach((char, i) => {
    fireEvent.change(inputs[i], { target: { value: char } });
  });
};

describe('ResetPasswordOtp Page', () => {
  beforeEach(() => {
    sessionStorage.setItem('reset_email', 'user@email.com');
  });
  afterEach(() => sessionStorage.clear());

  it('renders tanpa error', () => { renderPage(); });

  it('menampilkan judul Verifikasi OTP', () => {
    renderPage();
    expect(screen.getByText('Verifikasi OTP')).toBeInTheDocument();
  });

  it('menampilkan email tujuan OTP', () => {
    renderPage();
    expect(screen.getByText('user@email.com')).toBeInTheDocument();
  });

  it('menampilkan 6 kotak input OTP', () => {
    renderPage();
    expect(screen.getAllByRole('textbox').length).toBe(6);
  });

  it('menampilkan tombol Verifikasi', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /Verifikasi/i })).toBeInTheDocument();
  });

  it('menampilkan hitung mundur resend', () => {
    renderPage();
    expect(screen.getByText(/Kirim ulang dalam/i)).toBeInTheDocument();
  });

  it('menampilkan error saat submit OTP tidak lengkap', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Verifikasi/i }));
    expect(screen.getByText(/6 digit kode OTP/i)).toBeInTheDocument();
  });

  it('dapat mengisi kotak OTP', () => {
    renderPage();
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(inputs[0]).toHaveValue('1');
  });

  it('submit OTP lengkap tidak menampilkan error', () => {
    renderPage();
    fillOtp('123456');
    fireEvent.click(screen.getByRole('button', { name: /Verifikasi/i }));
    expect(screen.queryByText(/6 digit kode OTP/i)).not.toBeInTheDocument();
  });

  it('submit OTP valid menyimpan status verifikasi ke sessionStorage', () => {
    renderPage();
    fillOtp('123456');
    fireEvent.click(screen.getByRole('button', { name: /Verifikasi/i }));
    expect(sessionStorage.getItem('reset_otp_verified')).toBe('true');
  });

  it('tombol Kembali dapat diklik', () => {
    renderPage();
    fireEvent.click(screen.getByText(/Kembali/i));
  });
});
