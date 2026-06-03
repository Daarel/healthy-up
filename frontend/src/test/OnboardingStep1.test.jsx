import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OnboardingStep1 from '../pages/OnboardingStep1';
import * as AuthContextModule from '../context/AuthContext';

vi.mock('../lib/useNavigateWithTransition', () => ({
  useNavigateWithTransition: () => vi.fn(),
}));
vi.mock('../lib/api', () => ({
  authApi: {
    register: vi.fn().mockResolvedValue({ data: { user: { id: 1, username: 'test' } } }),
    logout: vi.fn().mockResolvedValue({}),
  },
  userApi: {
    getMe: vi.fn().mockRejectedValue(new Error('no session')),
  },
}));

const renderStep1 = () => {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    user: null,
    setUser: vi.fn(),
    isLoading: false,
  });
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

  it('menampilkan judul Buat Akun Anda', () => {
    renderStep1();
    expect(screen.getByText('Buat Akun Anda')).toBeInTheDocument();
  });

  it('menampilkan deskripsi onboarding', () => {
    renderStep1();
    expect(screen.getByText(/Mulai perjalanan kesehatan Anda/i)).toBeInTheDocument();
  });

  it('menampilkan label Nama Pengguna', () => {
    renderStep1();
    expect(screen.getByText('Nama Pengguna')).toBeInTheDocument();
  });

  it('menampilkan input Nama Pengguna', () => {
    renderStep1();
    expect(screen.getByPlaceholderText('Masukkan nama pengguna Anda')).toBeInTheDocument();
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

  it('menampilkan tombol Daftar', () => {
    renderStep1();
    expect(screen.getByRole('button', { name: /Daftar/i })).toBeInTheDocument();
  });

  it('menampilkan link Masuk untuk pengguna yang sudah punya akun', () => {
    renderStep1();
    expect(screen.getByText('Sudah punya akun?')).toBeInTheDocument();
    expect(screen.getByText('Masuk')).toBeInTheDocument();
  });

  it('dapat mengetik di input Nama Pengguna', () => {
    renderStep1();
    const input = screen.getByPlaceholderText('Masukkan nama pengguna Anda');
    fireEvent.change(input, { target: { value: 'John Doe' } });
    expect(input.value).toBe('John Doe');
  });

  it('dapat mengetik di input Email', () => {
    renderStep1();
    const input = screen.getByPlaceholderText('nama@email.com');
    fireEvent.change(input, { target: { value: 'john@example.com' } });
    expect(input.value).toBe('john@example.com');
  });

  it('menampilkan error saat submit form kosong', () => {
    renderStep1();
    fireEvent.click(screen.getByRole('button', { name: /Daftar/i }));
    expect(screen.getByText(/Nama tidak boleh kosong/i)).toBeInTheDocument();
    expect(screen.getByText(/Email tidak boleh kosong/i)).toBeInTheDocument();
    expect(screen.getByText(/Password tidak boleh kosong/i)).toBeInTheDocument();
  });

  it('menampilkan error nama terlalu pendek', () => {
    renderStep1();
    fireEvent.change(screen.getByPlaceholderText('Masukkan nama pengguna Anda'), {
      target: { value: 'ab' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Daftar/i }));
    expect(screen.getByText(/minimal 3 karakter/i)).toBeInTheDocument();
  });

  it('menampilkan error format email tidak valid', () => {
    renderStep1();
    fireEvent.change(screen.getByPlaceholderText('Masukkan nama pengguna Anda'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('nama@email.com'), {
      target: { value: 'bukan-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Daftar/i }));
    expect(screen.getByText(/Format email tidak valid/i)).toBeInTheDocument();
  });

  it('menampilkan error password kurang dari 8 karakter', () => {
    renderStep1();
    fireEvent.change(screen.getByPlaceholderText('Masukkan nama pengguna Anda'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('nama@email.com'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Minimal 8 karakter'), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Daftar/i }));
    expect(screen.getByText(/minimal 8 karakter/i)).toBeInTheDocument();
  });

  it('tombol toggle show/hide password berfungsi', () => {
    renderStep1();
    const input = screen.getByPlaceholderText('Minimal 8 karakter');
    const toggle = screen.getByRole('button', { name: /Tampilkan password/i });
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
  });

  it('error hilang saat user mengetik ulang', () => {
    renderStep1();
    fireEvent.click(screen.getByRole('button', { name: /Daftar/i }));
    expect(screen.getByText(/Nama tidak boleh kosong/i)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Masukkan nama pengguna Anda'), {
      target: { value: 'a' },
    });
    expect(screen.queryByText(/Nama tidak boleh kosong/i)).not.toBeInTheDocument();
  });
});
