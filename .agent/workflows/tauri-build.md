---
description: Tauri ile masaüstü uygulaması derleme
---

# Tauri Build Workflow

Bu workflow JSON Formatter'ı Windows veya Linux için native uygulama olarak derler.

## Ön Koşullar

1. Node.js 20+ kurulu olmalı
2. Rust 1.77+ kurulu olmalı
3. Tauri CLI kurulu olmalı (`cargo install tauri-cli`)

## Windows için Derleme

// turbo-all

1. Proje dizinine git:
```bash
cd src
```

2. Bağımlılıkları yükle:
```bash
npm install
```

3. Tauri build çalıştır:
```bash
npm run tauri:build
```

4. Çıktı dosyaları:
- `src-tauri/target/release/bundle/nsis/JSON Formatter_x.x.x_x64-setup.exe` (NSIS installer)
- `src-tauri/target/release/bundle/msi/JSON Formatter_x.x.x_x64_en-US.msi` (MSI installer)

## Linux (Ubuntu/Debian) için Derleme

1. Sistem bağımlılıklarını kur:
```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

2. Proje dizinine git:
```bash
cd src
```

3. Bağımlılıkları yükle:
```bash
npm install
```

4. Tauri build çalıştır:
```bash
npm run tauri:build
```

5. Çıktı dosyaları:
- `src-tauri/target/release/bundle/deb/json-formatter_x.x.x_amd64.deb` (Debian paketi)
- `src-tauri/target/release/bundle/appimage/json-formatter_x.x.x_amd64.AppImage` (AppImage)

## Geliştirme Modu

Development modunda çalıştırmak için:

```bash
cd src
npm run tauri:dev
```

Bu komut:
- Next.js dev server'ı http://localhost:3000'da başlatır
- Tauri uygulamasını debug modunda açar
- DevTools otomatik açılır (debug assertions aktif)

## Sorun Giderme

### Windows - Visual Studio Build Tools
Windows'ta derleme hatası alırsanız, Visual Studio Build Tools'un kurulu olduğundan emin olun:
- Visual Studio 2019/2022 veya Build Tools
- "Desktop development with C++" workload'u

### Linux - WebKit Bağımlılıkları
WebKit hataları alırsanız:
```bash
sudo apt install libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev
```

### Rust Güncellemesi
Rust'ı güncellemek için:
```bash
rustup update stable
```
