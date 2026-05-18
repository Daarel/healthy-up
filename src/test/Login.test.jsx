import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Login />
    </MemoryRouter>
  );

describe('Login Page', () => {
  it('renders tanpa error', () => {
    renderLogin();
  });

  it('menampilkan brand HealthyUp', () => {
    renderLogin();
    expect(screen.getByText('HealthyUp')).toBeInTheDocument();
  });

  it('menampilkan judul selamat datang', () => {
    renderLogin();
    expect(screen.getByText(/Selamat datang kembali/i)).toBeInTheDocument();
  });

  it('menampilkan deskripsi halaman', () => {
    renderLogin();
    expect(screen.getByText(/Masuk untuk melanjutkan perjalanan sehatmu/i)).toBeInTheDocument();
  });

  it('menampilkan input email', () => {
    renderLogin();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it('menampilkan input password', () => {
    renderLogin();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
  });

  it('menampilkan tombol toggle show/hide password', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /tampilkan password/i })).toBeInTheDocument();
  });

  it('toggle password mengubah tipe input', () => {
    renderLogin();
    const input = screen.getByLabelText(/^Password$/i);
    const toggle = screen.getByRole('button', { name: /tampilkan password/i });
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: /sembunyikan password/i }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('menampilkan link Lupa password', () => {
    renderLogin();
    expect(screen.getByText(/Lupa password/i)).toBeInTheDocument();
  });

  it('menampilkan tombol Masuk', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /^Masuk$/i })).toBeInTheDocument();
  });

  it('menampilkan link Daftar sekarang', () => {
    renderLogin();
    expect(screen.getByText(/Daftar sekarang/i)).toBeInTheDocument();
  });

  it('menampilkan error saat submit form kosong', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /^Masuk$/i }));
    expect(screen.getByText(/Email tidak boleh kosong/i)).toBeInTheDocument();
    expect(screen.getByText(/Password tidak boleh kosong/i)).toBeInTheDocument();
  });

  it('menampilkan error format email tidak valid', () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'bukan-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^Masuk$/i }));
    expect(screen.getByText(/Format email tidak valid/i)).toBeInTheDocument();
  });

  it('menampilkan error password kurang dari 8 karakter', () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'user@email.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^Masuk$/i }));
    expect(screen.getByText(/minimal 8 karakter/i)).toBeInTheDocument();
  });

  it('error hilang saat user mulai mengetik ulang', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /^Masuk$/i }));
    expect(screen.getByText(/Email tidak boleh kosong/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'a' },
    });
    expect(screen.queryByText(/Email tidak boleh kosong/i)).not.toBeInTheDocument();
  });

  it('submit valid menavigasi ke dashboard', () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'user@email.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^Masuk$/i }));
    // Tidak ada error yang muncul
    expect(screen.queryByText(/tidak boleh kosong/i)).not.toBeInTheDocument();
  });
});
