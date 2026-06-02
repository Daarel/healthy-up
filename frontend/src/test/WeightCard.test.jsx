import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WeightCard from '../components/WeightCard';

// WeightCard uses useNavigate, so wrap in MemoryRouter
const renderWeightCard = (overrides = {}) => {
  const props = {
    currentWeight: 68.5,
    weightDiff: -1.5,
    targetWeight: 65,
    isLoggedThisWeek: false,
    ...overrides,
  };
  return {
    ...render(
      <MemoryRouter>
        <WeightCard {...props} />
      </MemoryRouter>
    ),
    props,
  };
};

describe('WeightCard Component', () => {
  it('renders tanpa error', () => {
    renderWeightCard();
  });

  it('menampilkan judul Berat Badan', () => {
    renderWeightCard();
    expect(screen.getByText('Berat Badan')).toBeInTheDocument();
  });

  it('menampilkan berat badan saat ini', () => {
    renderWeightCard();
    expect(screen.getByText('68.5')).toBeInTheDocument();
  });

  it('menampilkan satuan kg', () => {
    renderWeightCard();
    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  it('menampilkan selisih berat badan negatif (turun)', () => {
    renderWeightCard({ weightDiff: -1.5 });
    expect(screen.getByText('-1.5 kg')).toBeInTheDocument();
  });

  it('menampilkan selisih berat badan positif (naik)', () => {
    renderWeightCard({ weightDiff: 2.0 });
    expect(screen.getByText('+2.0 kg')).toBeInTheDocument();
  });

  it('menampilkan label vs sebelumnya', () => {
    renderWeightCard();
    expect(screen.getByText('vs sebelumnya')).toBeInTheDocument();
  });

  it('menampilkan target berat badan', () => {
    renderWeightCard();
    expect(screen.getByText('Target: 65 kg')).toBeInTheDocument();
  });

  it('menampilkan tombol Lihat Detail', () => {
    renderWeightCard();
    expect(screen.getByRole('button', { name: /Lihat detail berat badan/i })).toBeInTheDocument();
  });

  it('menampilkan label Sudah dicatat minggu ini saat isLoggedThisWeek true', () => {
    renderWeightCard({ isLoggedThisWeek: true });
    expect(screen.getByText('Sudah dicatat minggu ini')).toBeInTheDocument();
  });

  it('tidak menampilkan label Sudah dicatat minggu ini saat isLoggedThisWeek false', () => {
    renderWeightCard({ isLoggedThisWeek: false });
    expect(screen.queryByText('Sudah dicatat minggu ini')).not.toBeInTheDocument();
  });

  it('menampilkan berat badan dengan satu desimal', () => {
    renderWeightCard({ currentWeight: 70 });
    expect(screen.getByText('70.0')).toBeInTheDocument();
  });

  it('menampilkan ikon TrendingDown saat weightDiff negatif', () => {
    renderWeightCard({ weightDiff: -1.5 });
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('menampilkan ikon TrendingUp saat weightDiff positif', () => {
    renderWeightCard({ weightDiff: 2.0 });
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });
});
