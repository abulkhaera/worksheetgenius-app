# PANDUAN DEPLOY CLOUD GRATIS (VERCEL) — WORKSHEETGENIUS ID

Dengan cara ini:
1. Anda mendapatkan link web resmi seperti: **https://worksheetgenius.vercel.app**.
2. **Tidak perlu memasukkan API Key sama sekali di browser.** Kunci disimpan aman di server Vercel (GEMINI_API_KEY).
3. Shortcut desktop Anda cukup mengarah ke URL web ini. Aplikasi akan **100% selalu bekerja di setiap sesi**, kapan saja, di laptop, tablet, atau HP mana pun!

---

## Langkah 1: Siapkan Folder Proyek di Komputer Anda
Pastikan struktur folder Anda seperti ini:
```text
worksheetgenius/
├── index.html
├── vercel.json
├── package.json
└── api/
    ├── generate-worksheet.js
    └── generate-image.js
```

---

## Langkah 2: Unggah ke GitHub (1 Menit)
1. Buka https://github.com dan buat repositori baru (misal: worksheetgenius-app).
2. Unggah file-file di atas ke repositori GitHub tersebut.

---

## Langkah 3: Deploy Gratis di Vercel (1 Menit)
1. Buka https://vercel.com lalu Log In dengan akun GitHub Anda.
2. Klik tombol "Add New..." -> "Project".
3. Pilih repositori worksheetgenius-app yang baru dibuat -> klik "Import".
4. Buka bagian Environment Variables:
   - Key: GEMINI_API_KEY
   - Value: Masukkan API Key Google Anda (AIzaSy...)
   - Klik "Add".
5. Klik tombol biru "Deploy".

---

## Selesai! 🎉
Dalam waktu kurang dari 30 detik, Anda akan mendapatkan URL web publik resmi.
