# 🏆 FIFA World Cup 2026 Bracket — Vercel Deployment Guide

Bracket interaktif dengan skor otomatis dari API resmi.
**API key tersimpan aman di server Vercel — tidak pernah terekspos ke browser.**

---

## 📁 Struktur Folder

```
wc2026-bracket/
├── vercel.json                     ← Konfigurasi Vercel
├── package.json
├── .env.example                    ← Template environment variables
├── .gitignore
├── api/
│   └── wc-scores.js               ← Serverless function (proxy aman)
└── public/
    └── index.html                  ← Bracket HTML (tanpa API key)
```

---

## 🚀 Cara Deploy ke Vercel (10 menit)

### Langkah 1 — Push ke GitHub

1. Buat repo baru di [github.com](https://github.com) bernama `wc2026-bracket`
2. Upload semua file dari folder ini ke repo tersebut
3. Commit & push

### Langkah 2 — Import ke Vercel

1. Buka [vercel.com](https://vercel.com) → Login (bisa pakai GitHub)
2. Klik **"Add New Project"**
3. Pilih repo `wc2026-bracket` → klik **"Import"**
4. Framework: pilih **"Other"** (bukan Next.js, bukan Vite)
5. Build & Output settings:
   - Build Command: *(kosongkan)*
   - Output Directory: `public`
6. Jangan deploy dulu — lanjut set env var di bawah

### Langkah 3 — Set Environment Variables (WAJIB sebelum deploy)

Masih di halaman import, scroll ke bawah ke **"Environment Variables"** atau:
- Vercel Dashboard → Project → **Settings → Environment Variables**

Tambahkan variabel berikut:

| Name | Value | Environment |
|------|-------|-------------|
| `API_PROVIDER` | `football-data` | Production, Preview, Development |
| `FOOTBALL_DATA_API_KEY` | `(API key kamu)` | Production, Preview, Development |
| `CACHE_TTL` | `300` | Production, Preview, Development |

Klik **"Save"** setelah tiap variabel.

### Langkah 4 — Dapatkan API Key Gratis

**football-data.org (Rekomendasi):**
1. Buka [football-data.org/client/register](https://www.football-data.org/client/register)
2. Isi nama + email → cek inbox → copy API key
3. Paste ke `FOOTBALL_DATA_API_KEY` di Vercel

**Alternatif lain:**

| Provider | Daftar di | Env var |
|----------|-----------|---------|
| wc2026api.com | [wc2026api.com](https://wc2026api.com) | `WC2026_API_KEY`, ubah `API_PROVIDER=wc2026api` |
| API-Football | [rapidapi.com](https://rapidapi.com/api-sports/api/api-football) | `APIFOOTBALL_API_KEY`, ubah `API_PROVIDER=apifootball` |

### Langkah 5 — Deploy & Test

1. Klik **"Deploy"**
2. Tunggu ~30 detik hingga selesai
3. Buka URL yang diberikan Vercel (contoh: `https://wc2026-bracket.vercel.app`)
4. Klik tombol **🔄 SYNC** di header bracket
5. Skor otomatis terisi dari API!

---

## 🔒 Arsitektur Keamanan

```
┌─────────────┐     GET /api/wc-scores     ┌──────────────────────────┐
│   Browser   │ ─────────────────────────► │  Vercel Serverless Fn    │
│  (publik)   │ ◄───────────────────────── │  api/wc-scores.js        │
└─────────────┘      JSON skor saja        │  ✅ API key ada di sini  │
                                           └──────────┬───────────────┘
                                                      │ X-Auth-Token: ***
                                                      ▼
                                           ┌──────────────────────────┐
                                           │  football-data.org       │
                                           │  (server eksternal)      │
                                           └──────────────────────────┘
```

- Browser **tidak pernah** melihat API key
- DevTools hanya menampilkan JSON skor
- API key dienkripsi di Vercel environment

---

## 🧪 Test Lokal

```bash
# Install Vercel CLI
npm install -g vercel

# Setup env lokal
cp .env.example .env.local
# Edit .env.local, isi API key

# Jalankan development server
vercel dev

# Buka: http://localhost:3000
# Test endpoint: http://localhost:3000/api/wc-scores
```

---

## 📊 Limits Free Tier

| Service | Free Limit | Cukup? |
|---------|-----------|--------|
| Vercel Functions | 100 GB-hrs/bulan | ✅ Lebih dari cukup |
| Vercel Bandwidth | 100 GB/bulan | ✅ Aman |
| football-data.org | 10 req/menit | ✅ Cache 5 menit = ~288 req/hari |
| API-Football | 100 req/hari | ✅ Cache 5 menit cukup |

---

## ⚙️ Konfigurasi Lanjutan

**Ganti interval cache** (lebih sering update saat live match):
```
CACHE_TTL=60   # 1 menit saat pertandingan berlangsung
CACHE_TTL=300  # 5 menit normal (default)
```

**Ganti provider di Vercel tanpa redeploy:**
1. Settings → Environment Variables → edit `API_PROVIDER`
2. Vercel → Deployments → "Redeploy" deployment terakhir

---

## ❓ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "Cannot reach server" | Pastikan sudah deploy ke Vercel, bukan buka file lokal |
| "API_KEY not configured" | Cek Environment Variables di Vercel Settings |
| Error 502 | Lihat Vercel → Functions → View Logs |
| Skor tidak update | Tunggu cache habis, atau kurangi `CACHE_TTL` |
| Vercel: "Function not found" | Pastikan file ada di folder `api/`, bukan `netlify/functions/` |

---

## 🔄 Perbedaan Netlify vs Vercel

| Fitur | Netlify | Vercel |
|-------|---------|--------|
| Folder function | `netlify/functions/` | `api/` |
| Config file | `netlify.toml` | `vercel.json` |
| Handler export | `exports.handler` | `export default` |
| Deploy speed | ~1-2 menit | ~20-30 detik |
| Free tier | 125k req/bulan | 100 GB-hrs |
| Kemudahan setup | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

Keduanya aman — pilih sesuai preferensi!

---

*FIFA World Cup 2026 · USA · Canada · Mexico · Jun 11 – Jul 19, 2026*
