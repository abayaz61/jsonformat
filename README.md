# JSON Formatter - Cross-Platform Desktop Application

Modern JSON formatter, validator ve tree viewer uygulaması. **Tauri 2.0** ile Windows ve Linux için native masaüstü uygulaması olarak derlenebilir.

## ✨ Özellikler

- **JSON Format & Beautify** — Tek tıkla JSON biçimlendirme ve güzelleştirme
- **Minify** — Boşlukları kaldırarak JSON sıkıştırma
- **Tree View** — Etkileşimli, katlanabilir ağaç görünümü
- **Model Export** — TypeScript, Python, Java, C#, Go, Rust sınıf modeli oluşturma
- **Bozuk JSON Düzeltme** — Kısmen geçerli JSON'u biçimlendirip kurtarma
- **Akıllı Filtreler**:
  - Null değerleri yoksayma
  - Varsayılan tarihleri yoksayma
  - Sıfır değerleri kaldırma
  - **Boş dizileri yoksayma** (`[]` length 0 olan array'ler)
  - .NET tarihlerini dönüştürme
- **20 Renk Teması** — Karanlık ve aydınlık mod desteği
- **Klavye Kısayolları** — Ctrl+Shift+F, Ctrl+S ve dahası
- **6 Dil Desteği** — İngilizce, Türkçe, Almanca, Fransızca, İtalyanca, Çince
- **PWA & Offline** — Progressive Web App olarak kurulabilir, çevrimdışı çalışır
- **Cross-Platform** — Web, Windows ve Linux masaüstü uygulaması

## 🖥️ Desteklenen Platformlar

| Platform | Paket Formatları | Durum |
|----------|-----------------|-------|
| **Windows** | MSI, NSIS (exe) | ✅ Hazır |
| **Ubuntu/Linux** | DEB, AppImage | ✅ Hazır |
| **macOS** | DMG, App Bundle | 📋 Planlandı |
| **iOS** | IPA | 📋 Planlandı |
| **Android** | APK | 📋 Planlandı |

## 🚀 Hızlı Başlangıç

### Gereksinimler

1. **Node.js** 20.x veya üzeri
2. **pnpm** veya **npm**
3. **Rust** 1.77.2 veya üzeri (masaüstü derlemesi için)
4. **Tauri CLI** (`cargo install tauri-cli`)

### Geliştirme Modu

```bash
cd src
npm install
npm run tauri:dev
```

Bu komut:
- Next.js dev server'ı başlatır (http://localhost:3000)
- Tauri uygulamasını debug modunda çalıştırır
- DevTools otomatik açılır (debug modunda)

### Üretim Derlemesi

#### Windows için:

```bash
cd src
npm run tauri:build
```

Çıktı dosyaları:
- `src-tauri/target/release/bundle/nsis/JSON Formatter_x.x.x_x64-setup.exe`
- `src-tauri/target/release/bundle/msi/JSON Formatter_x.x.x_x64_en-US.msi`

#### Ubuntu/Linux için:

Linux makinede veya WSL2'de:

```bash
# Gerekli sistem bağımlılıkları (Ubuntu/Debian)
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file \
  libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev

# Rust kurulumu (yoksa)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Derleme
cd src
npm install
npm run tauri:build
```

Çıktı dosyaları:
- `src-tauri/target/release/bundle/deb/json-formatter_x.x.x_amd64.deb`
- `src-tauri/target/release/bundle/appimage/json-formatter_x.x.x_amd64.AppImage`

## 📦 Proje Yapısı

```
json-formatter2/
├── src/                         # Next.js kaynak kodu
│   ├── app/                     # Next.js App Router
│   ├── components/              # React bileşenleri
│   ├── hooks/                   # Custom React hooks
│   ├── utils/                   # Utility fonksiyonları
│   │   ├── tauri.ts            # Tauri platform abstraction
│   │   ├── clipboard.ts        # Clipboard işlemleri
│   │   └── fileOperations.ts   # Dosya işlemleri
│   └── src-tauri/              # Tauri/Rust kaynak kodu
│       ├── Cargo.toml          # Rust bağımlılıkları
│       ├── tauri.conf.json     # Tauri yapılandırması
│       ├── capabilities/       # Güvenlik izinleri
│       └── src/
│           ├── lib.rs          # Rust ana modülü
│           └── main.rs         # Uygulama giriş noktası
└── docs/                        # Dokümantasyon
```

## 🔧 Yapılandırma

### Tauri Yapılandırması (`src/src-tauri/tauri.conf.json`)

- **productName**: Uygulama adı
- **identifier**: Benzersiz uygulama tanımlayıcısı
- **build.frontendDist**: Web çıktı dizini
- **bundle.targets**: Oluşturulacak paket formatları

### İzinler (`src/src-tauri/capabilities/default.json`)

Uygulama şu izinlere sahip:
- Dosya okuma/yazma
- Clipboard okuma/yazma
- Dosya aç/kaydet dialogları
- Harici URL açma

## 🛠️ NPM Script'leri

```bash
npm run dev              # Next.js geliştirme sunucusu
npm run build            # Sadece web build
npm run tauri:dev        # Tauri geliştirme modu
npm run tauri:build      # Tauri üretim derlemesi
```

## 📱 Web Versiyonu

Uygulama ayrıca PWA olarak web'de de çalışır:
- **Demo**: [jsonformat.com](https://jsonformat.com)
- Offline çalışma desteği
- Cihaza kurulabilir

## 🔐 Güvenlik

Tauri, güvenlik odaklı bir framework'tür:
- Minimal izin sistemi (capabilities)
- WebView içerik güvenliği (CSP)
- Rust'ın bellek güvenliği garantileri

## 📄 Lisans

MIT License

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için önce bir issue açınız.

---

**JSON Formatter** - Hızlı, güvenli, cross-platform JSON aracı 🚀
