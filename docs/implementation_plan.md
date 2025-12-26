# JSON Formatter & Viewer Tool - Implementation Plan

Modern, minimalist bir JSON biçimlendirme ve görüntüleme aracı geliştirme planı. [jsonviewer.stack.hu](https://jsonviewer.stack.hu/) sitesi referans alınarak hazırlanmıştır.

---

## Proje Gereksinimleri

### Temel Özellikler
- ✅ JSON biçimlendirme (beautify/format)
- ✅ JSON sıkıştırma (minify/compress)
- ✅ JSON nesneleştirme ve parse etme
- ✅ Sözdizimi doğrulama ve hata gösterimi

### Dosya ve Pano İşlemleri
- ✅ Kopyalama fonksiyonu
- ✅ Yapıştırma fonksiyonu
- ✅ JSON dosyası indirme
- ✅ Dosya yükleme/import

### Görünüm ve Tema
- ✅ Dark/Light mode toggle
- ✅ Çoklu renk teması seçenekleri (6 tema)
- ✅ Minimalist tasarım
- ✅ Maximum JSON gösterimi
- ✅ İnce header alanı
- ✅ Tam ekran JSON gösterimi

### Çoklu Dil Desteği
- ✅ İngilizce (en)
- ✅ Türkçe (tr)
- ✅ Almanca (de)
- ✅ İtalyanca (it)
- ✅ Fransızca (fr)
- ✅ Çince (zh)

### Oturum ve Ayar Yönetimi
- ✅ Son oturumu hatırlama
- ✅ Ayarları saklama (tema, dil, renk)
- ✅ PWA desteği

---

## Teknik Mimari

### Teknoloji Stack

| Teknoloji | Versiyon | Kullanım Alanı |
|-----------|----------|----------------|
| Next.js | 16.1.1 | Framework |
| React | 19.2.3 | UI Library |
| TypeScript | ^5 | Type Safety |
| Tailwind CSS | ^4 | Styling |
| Monaco Editor | ^4.6.0 | JSON Editor |
| next-pwa | ^5.6.0 | PWA Support |
| lucide-react | ^0.469.0 | Icons |

### Klasör Yapısı

```
src/json-formatter/
├── app/
│   ├── globals.css          # Global stiller ve tema değişkenleri
│   ├── layout.tsx           # Root layout (providers ile)
│   └── page.tsx             # Ana sayfa
├── components/
│   ├── Header/              # İnce header bileşeni
│   ├── JsonEditor/          # Monaco Editor wrapper
│   ├── Toolbar/             # İşlem butonları
│   ├── Settings/            # Ayarlar paneli
│   └── ui/                  # Genel UI bileşenleri
├── contexts/
│   ├── ThemeContext.tsx     # Tema state yönetimi
│   ├── LanguageContext.tsx  # Dil state yönetimi
│   └── SettingsContext.tsx  # Genel ayarlar
├── hooks/
│   ├── useLocalStorage.ts   # localStorage hook
│   ├── useJsonFormatter.ts  # JSON işlemleri hook
│   ├── useFullscreen.ts     # Tam ekran kontrolü
│   └── useSessionRestore.ts # Oturum geri yükleme
├── utils/
│   ├── jsonOperations.ts    # Format, minify, validate
│   ├── fileOperations.ts    # Download, upload
│   └── clipboard.ts         # Copy, paste
├── locales/
│   ├── en.json              # English
│   ├── tr.json              # Türkçe
│   ├── de.json              # Deutsch
│   ├── it.json              # Italiano
│   ├── fr.json              # Français
│   └── zh.json              # 中文
├── styles/themes/
│   ├── colors.ts            # Renk paleti tanımları
│   └── themes.ts            # Tema konfigürasyonları
├── types/
│   └── index.ts             # TypeScript type tanımları
└── public/
    ├── manifest.json        # PWA manifest
    └── icons/               # PWA ikonları
```

---

## Renk Temaları

| Tema Adı | Accent Color | Hex |
|----------|-------------|-----|
| Ocean Blue | 🔵 | #667eea |
| Forest Green | 🟢 | #48bb78 |
| Sunset Orange | 🟠 | #ed8936 |
| Purple Night | 🟣 | #9f7aea |
| Rose Pink | 🩷 | #ed64a6 |
| Midnight Teal | 🧊 | #4fd1c5 |

---

## Bileşen Detayları

### Header (40-48px)
```
┌─────────────────────────────────────────────────────────────┐
│ 🔧 JSON Formatter                    [🌙] [🌍] [⚙️] [⛶]   │
└─────────────────────────────────────────────────────────────┘
```

### Toolbar
```
┌─────────────────────────────────────────────────────────────┐
│ [Format] [Minify] [Copy] [Paste] [Download] [Clear] [⛶]    │
└─────────────────────────────────────────────────────────────┘
```

### Editor Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header (thin)                                               │
├─────────────────────────────────────────────────────────────┤
│ Toolbar                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│                    JSON Editor (max area)                   │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## PWA Konfigürasyonu

### manifest.json
```json
{
  "name": "JSON Formatter",
  "short_name": "JSONFmt",
  "description": "Modern JSON formatting and viewing tool",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f1a",
  "theme_color": "#667eea",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## Önemli Notlar

> ⚠️ **Editör Seçimi**: Monaco Editor kullanılacak (VS Code'un editörü)
> - Güçlü syntax highlighting
> - Otomatik tamamlama
> - Hata işaretleme

> ℹ️ **Test projesi eklenmeyecek** (kullanıcı isteği)

---

## Sonraki Adımlar

1. İmplementasyon planı onaylandıktan sonra kod yazmaya başlanacak
2. Önce temel altyapı (contexts, hooks, utils)
3. Sonra UI bileşenleri
4. En son PWA desteği ve optimizasyonlar
