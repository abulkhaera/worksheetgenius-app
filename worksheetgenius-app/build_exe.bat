@echo off
title WorksheetGenius ID - Windows .EXE Compiler
color 0B
echo ========================================================
echo   WorksheetGenius ID - Kompilasi Windows (.EXE)
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  color 0C
  echo [ERROR] Node.js belum terinstall di komputer ini.
  echo Silakan unduh dan install Node.js (LTS) dari https://nodejs.org
  pause
  exit /b
)

if not exist "index.html" (
  color 0C
  echo [ERROR] File 'index.html' tidak ditemukan di folder ini!
  pause
  exit /b
)

echo [1/3] Mengunduh modul Electron...
call npm install
if %errorlevel% neq 0 (
  color 0C
  echo [ERROR] Gagal menginstall dependensi npm.
  pause
  exit /b
)

echo.
echo [2/3] Membangun file WorksheetGenius ID.exe portable...
call npm run build:exe
if %errorlevel% neq 0 (
  color 0C
  echo [ERROR] Gagal melakukan proses kompilasi .exe.
  pause
  exit /b
)

color 0A
echo.
echo ========================================================
echo   SUKSES! File WorksheetGenius ID.exe berhasil dibuat!
echo   Lokasi file: folder 'dist'
echo ========================================================
echo.
if exist "dist" ( explorer dist )
pause
