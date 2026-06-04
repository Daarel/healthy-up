<div align="center">

# 🌿 HealthyUp

**AI-Powered Gamified Health & Fitness Tracker**

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Vite](https://img.shields.io/badge/Vite_8-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](#)
[![Express.js](https://img.shields.io/badge/Express.js_5-404D59?style=for-the-badge)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](#)
[![Prisma](https://img.shields.io/badge/Prisma_7-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](#)

*Membangun gaya hidup sehat tidak pernah semenyenangkan ini. Selesaikan misi dari AI, kumpulkan XP, naik level, dan tukarkan reward Anda!*

</div>

---

## 📖 Tentang Projek
**HealthyUp** adalah aplikasi berbasis web yang menggabungkan kecerdasan buatan (*Artificial Intelligence*) dengan konsep gamifikasi untuk membantu pengguna membangun kebiasaan hidup sehat secara konsisten. 

Projek ini dikembangkan sebagai untuk **Capstone Project**, Coding Camp 2026 powered by DBS. Aplikasi ini melacak metrik kesehatan seperti BMI dan kalori, menugaskan misi harian yang dipersonalisasi oleh AI, dan memverifikasi penyelesaian tugas melalui sistem *dashboard* Admin yang aman.

## ✨ Fitur Utama

### 🤖 AI-Generated Quests
Misi kesehatan (Fisik, Nutrisi, Mental) di-generate secara otomatis setiap minggu menggunakan model AI, disesuaikan dengan profil tubuh pengguna (*Factual BMI*, Tinggi, Berat, Target Berat Badan).

### 🎮 Sistem Gamifikasi & Progresi
* **Experience Points (XP) & Levels:** Selesaikan misi untuk mendapatkan XP. 
* **Dynamic Titles:** Capai pangkat baru seiring berjalannya waktu (*Pemula ➔ Penggerak ➔ Pejuang Sehat ➔ Kesatria Bugar ➔ Master Vitalitas ➔ Legenda*).
* **Reward Points:** Kumpulkan poin untuk ditukarkan dengan *voucher* atau hadiah di Katalog Reward.

### 🛡️ Admin Verification System
Pengguna wajib mengunggah foto/video bukti penyelesaian tugas. Admin akan meninjau (*Approve/Reject*) bukti tersebut secara *real-time* sebelum XP dan Kalori masuk ke profil pengguna.

### 📊 Health & Calorie Tracker
Pemantauan *real-time* untuk kalori yang terbakar dan log berat badan mingguan. Kalori akan otomatis bertambah saat misi fisik disetujui oleh admin.

---

## 🛠️ Tech Stack & Arsitektur

### Frontend (Client-Side)
Dibangun sebagai *Single Page Application* (SPA) dengan performa tinggi:
* **Core:** React 19 & Vite 8
* **Routing:** React Router DOM
* **Styling & UI:** Tailwind CSS, Radix UI Primitives, Lucide React
* **Testing:** Vitest & React Testing Library

### Backend (Server-Side)
Arsitektur RESTful API yang kokoh dan aman:
* **Core:** Node.js & Express.js 5
* **Database & ORM:** PostgreSQL & Prisma ORM 7 (dengan `@prisma/adapter-pg`)
* **Data Validation:** Zod
* **Media Storage:** Cloudinary (via Multer)
* **Security & Auth:** JSON Web Tokens (JWT), bcryptjs, Helmet, CORS
* **Email Service:** Nodemailer & Resend

---

## 🚀 Cara Menjalankan Projek (Local Development)

### 1. Prasyarat
Pastikan Anda telah menginstal:
* Node.js (v18 atau lebih baru)
* PostgreSQL
* Git