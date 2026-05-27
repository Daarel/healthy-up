import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OnboardingStep5 from '../pages/OnboardingStep5';

const renderStep5 = () => {
  return render(
    <MemoryRouter initialEntries={['/onboarding/5']}>
      <OnboardingStep5 stepDelay={0} finalDelay={0} />
    </MemoryRouter>
  );
};

// Tunggu sampai fase "ready" muncul (delay = 0 saat test, jadi sangat cepat)
const waitForReady = () =>
  waitFor(
    () => expect(screen.getByText(/Rencanamu sudah siap/i)).toBeInTheDocument(),
    { timeout: 2000 }
  );

describe('OnboardingStep5 Page', () => {
  // ── Fase Loading ──────────────────────────────────────────

  it('renders tanpa error', () => {
    renderStep5();
  });

  it('menampilkan indikator langkah 5 dari 5', () => {
    renderStep5();
    expect(screen.getByText('Langkah 5')).toBeInTheDocument();
  });

  it('menampilkan fase loading saat pertama kali dibuka', () => {
    renderStep5();
    expect(screen.getByText(/AI sedang menyusun rencanamu/i)).toBeInTheDocument();
    expect(screen.getByTestId('ai-loading-log')).toBeInTheDocument();
  });

  it('menampilkan baris pertama log AI saat loading', () => {
    renderStep5();
    expect(screen.getByText(/Menganalisis data kesehatan/i)).toBeInTheDocument();
  });

  it('menampilkan tombol Kembali', () => {
    renderStep5();
    expect(screen.getByText('Kembali')).toBeInTheDocument();
  });

  it('tombol Kembali dapat diklik', () => {
    renderStep5();
    fireEvent.click(screen.getByText('Kembali'));
  });

  // ── Fase Ready ────────────────────────────────────────────

  it('menampilkan fase ready setelah loading selesai', async () => {
    renderStep5();
    await waitForReady();
  });

  it('menampilkan ringkasan kalori, olahraga, dan estimasi waktu', async () => {
    renderStep5();
    await waitForReady();
    expect(screen.getByText('1.800')).toBeInTheDocument();
    expect(screen.getByText('kkal/hari')).toBeInTheDocument();
    expect(screen.getByText('5x')).toBeInTheDocument();
    expect(screen.getByText('olahraga/minggu')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('minggu target')).toBeInTheDocument();
  });

  it('menampilkan tab Tugas Hari Ini dan Jadwal Olahraga', async () => {
    renderStep5();
    await waitForReady();
    expect(screen.getByText('Tugas Hari Ini')).toBeInTheDocument();
    expect(screen.getByText('Jadwal Olahraga')).toBeInTheDocument();
  });

  it('tab Tugas Hari Ini aktif secara default dan menampilkan daftar tugas', async () => {
    renderStep5();
    await waitForReady();
    expect(screen.getByText('Minum air 8 gelas')).toBeInTheDocument();
    expect(screen.getByText('Makan sayur 3 porsi')).toBeInTheDocument();
    expect(screen.getByText('Jalan kaki 30 menit')).toBeInTheDocument();
    expect(screen.getByText('Tidur 8 jam')).toBeInTheDocument();
    expect(screen.getByText('Sarapan bergizi')).toBeInTheDocument();
  });

  it('tugas menampilkan poin reward', async () => {
    renderStep5();
    await waitForReady();
    expect(screen.getAllByText(/\+\d+/).length).toBeGreaterThan(0);
  });

  it('dapat berpindah ke tab Jadwal Olahraga', async () => {
    renderStep5();
    await waitForReady();
    fireEvent.click(screen.getByText('Jadwal Olahraga'));
    expect(screen.getByText('Senin')).toBeInTheDocument();
    expect(screen.getByText('Rabu')).toBeInTheDocument();
    expect(screen.getByText('Minggu')).toBeInTheDocument();
  });

  it('jadwal olahraga menampilkan aktivitas per hari', async () => {
    renderStep5();
    await waitForReady();
    fireEvent.click(screen.getByText('Jadwal Olahraga'));
    expect(screen.getByText(/Cardio ringan/i)).toBeInTheDocument();
    expect(screen.getByText(/Latihan kekuatan/i)).toBeInTheDocument();
    expect(screen.getByText(/Istirahat penuh/i)).toBeInTheDocument();
  });

  it('menampilkan keterangan AI update harian', async () => {
    renderStep5();
    await waitForReady();
    expect(
      screen.getByText(/Tugas dan jadwal akan diperbarui AI setiap hari/i)
    ).toBeInTheDocument();
  });

  it('menampilkan tombol Mulai Perjalanan', async () => {
    renderStep5();
    await waitForReady();
    expect(screen.getByText('Mulai Perjalanan')).toBeInTheDocument();
  });

  it('tombol Mulai Perjalanan dapat diklik', async () => {
    renderStep5();
    await waitForReady();
    fireEvent.click(screen.getByText('Mulai Perjalanan'));
  });
});
