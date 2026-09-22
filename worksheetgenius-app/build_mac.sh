#!/bin/bash
echo ""
echo "  WorksheetGenius ID - Kompilasi macOS (.app / .dmg)"
echo ""

if ! command -v node &> /dev/null; then
  echo "❌ [ERROR] Node.js belum terpasang di Mac Anda."
  echo "Silakan unduh dan pasang Node.js (LTS) dari https://nodejs.org"
  exit 1
fi

if [ ! -f "index.html" ]; then
  echo "❌ [ERROR] File 'index.html' tidak ditemukan di folder ini!"
  exit 1
fi

echo "[1/3] Memeriksa dependensi Node.js..."
npm install
if [ $? -ne 0 ]; then
  echo "❌ [ERROR] Gagal menginstall dependensi npm."
  exit 1
fi

echo ""
echo "[2/3] Membangun bundle aplikasi macOS (.app)..."
npm run build:mac
if [ $? -ne 0 ]; then
  echo "❌ [ERROR] Proses build macOS gagal."
  exit 1
fi

echo ""
echo "  🎉 SUKSES! File WorksheetGenius ID.app berhasil dibuat!"
echo "  Lokasi bundle .app dan installer .dmg: folder 'dist'"
echo ""
if [ -d "dist" ]; then open dist; fi
