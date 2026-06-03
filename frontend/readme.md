# HealthyUp Frontend

HealthyUp adalah aplikasi web untuk membantu pengguna membangun kebiasaan hidup sehat. Aplikasi ini memakai konsep gamifikasi, sehingga pengguna bisa menyelesaikan tugas kesehatan, memantau progres, naik level, dan menukar hadiah.

Project ini adalah bagian frontend dari aplikasi HealthyUp.

## Fitur Utama

- Onboarding pengguna baru
- Login dan autentikasi pengguna
- Lupa password dan reset password dengan OTP
- Dashboard progres kesehatan
- Daftar tugas kesehatan harian
- Input dan pengingat berat badan
- Sistem level dan poin
- Halaman hadiah atau reward
- Halaman profil pengguna
- Proteksi halaman untuk pengguna yang sudah login

## Teknologi

- React
- Vite
- React Router DOM
- Tailwind CSS
- Vitest
- Testing Library
- ESLint

## Persiapan

Pastikan sudah menginstall:

- Node.js
- npm

Untuk mengecek versi Node.js dan npm:

```bash
node -v
npm -v
```

## Cara Menjalankan Project

1. Install dependency:

```bash
npm install
```

2. Jalankan development server:

```bash
npm run dev
```

3. Buka aplikasi di browser sesuai URL yang muncul di terminal, biasanya:

```text
http://localhost:5173
```

## Konfigurasi API

Frontend mengambil alamat backend dari environment variable:

```env
VITE_BASE_URL=http://localhost:5001/api/v1
```

Jika `VITE_BASE_URL` tidak diisi, aplikasi akan memakai fallback:

```text
http://localhost:5001/api/v1
```

Pastikan backend berjalan di alamat tersebut agar fitur login, register, profil, dan data pengguna dapat digunakan.

Contoh isi file `.env.example`:

```env
VITE_BASE_URL=http://localhost:5001/api/v1
```

Catatan: variable environment yang ingin dibaca oleh Vite harus diawali dengan `VITE_`.

## Script yang Tersedia

Menjalankan aplikasi mode development:

```bash
npm run dev
```

Membuat build production:

```bash
npm run build
```

Menjalankan preview hasil build:

```bash
npm run preview
```

Menjalankan linting:

```bash
npm run lint
```

Menjalankan test:

```bash
npm run test
```

## Struktur Folder

```text
frontend/
├── public/              # Asset publik
├── src/
│   ├── assets/          # Gambar dan asset aplikasi
│   ├── components/      # Komponen UI reusable
│   ├── context/         # Context React
│   ├── lib/             # Helper dan API client
│   ├── pages/           # Halaman aplikasi
│   ├── test/            # File testing
│   ├── App.jsx          # Routing utama aplikasi
│   ├── main.jsx         # Entry point React
│   └── index.css        # Style utama
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── readme.md
```

## Halaman Aplikasi

- `/onboarding/1` untuk halaman onboarding
- `/login` untuk login
- `/lupa-password` untuk meminta reset password
- `/reset-password/otp` untuk input OTP
- `/reset-password/baru` untuk membuat password baru
- `/dashboard` untuk dashboard pengguna
- `/tugas` untuk daftar tugas
- `/hadiah` untuk halaman hadiah
- `/profil` untuk profil pengguna

Halaman `/dashboard`, `/tugas`, `/hadiah`, dan `/profil` hanya bisa diakses setelah login.

## Testing

Project ini sudah memiliki beberapa test untuk komponen dan halaman di folder `src/test`.

Jalankan semua test dengan:

```bash
npm run test
```

## Catatan Pengembangan

- Token login disimpan di `localStorage` dengan key `healthyup:token`.
- Request API utama berada di `src/lib/api.js`.
- Routing utama berada di `src/App.jsx`.
- Komponen halaman berada di `src/pages`.
- Komponen yang dapat dipakai ulang berada di `src/components`.
