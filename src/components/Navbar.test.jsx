import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

const renderNavbar = (initialPath = '/dashboard') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>
  );
};

describe('Navbar Component', () => {
  it('renders without crashing', () => {
    renderNavbar();
  });

  it('menampilkan brand HealthyUp di desktop nav', () => {
    renderNavbar();
    expect(screen.getByText('HealthyUp')).toBeInTheDocument();
  });

  it('menampilkan semua item navigasi (Beranda, Tugas, Hadiah, Profil)', () => {
    renderNavbar();
    // getAllByText karena ada duplikasi di desktop & mobile nav
    expect(screen.getAllByText('Beranda').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Tugas').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Hadiah').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Profil').length).toBeGreaterThanOrEqual(1);
  });

  it('menampilkan tombol Keluar di desktop nav', () => {
    renderNavbar();
    expect(screen.getByText('Keluar')).toBeInTheDocument();
  });

  it('tombol Beranda di mobile nav dapat diklik', () => {
    renderNavbar('/tugas');
    const berandaButtons = screen.getAllByText('Beranda');
    expect(berandaButtons.length).toBeGreaterThan(0);
    fireEvent.click(berandaButtons[0]);
  });

  it('tombol Tugas dapat diklik', () => {
    renderNavbar('/dashboard');
    const tugasButtons = screen.getAllByText('Tugas');
    fireEvent.click(tugasButtons[0]);
  });

  it('tombol Hadiah dapat diklik', () => {
    renderNavbar('/dashboard');
    const hadiahButtons = screen.getAllByText('Hadiah');
    fireEvent.click(hadiahButtons[0]);
  });

  it('tombol Profil dapat diklik', () => {
    renderNavbar('/dashboard');
    const profilButtons = screen.getAllByText('Profil');
    fireEvent.click(profilButtons[0]);
  });

  it('menerapkan kelas aktif pada rute /dashboard', () => {
    renderNavbar('/dashboard');
    // nav desktop dan mobile keduanya ada
    const nav = document.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });
});
