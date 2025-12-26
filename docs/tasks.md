# JSON Formatter Tool - Görev Listesi

## Proje Kurulumu ve Temel Yapı
- [x] Next.js proje yapılandırması (PWA desteği ekleme)
- [x] Klasör yapısını oluşturma (components, hooks, utils, locales, contexts, styles)
- [x] Tailwind CSS tema yapılandırması (dark/light mode + renk temaları)
- [x] Global CSS ayarları ve tipografi

## Çoklu Dil Desteği (i18n)
- [x] Dil dosyaları oluşturma (en, tr, de, it, fr, zh)
- [x] Dil context ve provider oluşturma
- [x] Dil değiştirme bileşeni
- [x] Dil tercihini localStorage'a kaydetme

## Tema ve Görünüm Sistemi
- [x] Dark/Light mode toggle
- [x] Çoklu renk teması seçenekleri (6 tema)
- [x] Tema tercihlerini localStorage'a kaydetme
- [x] CSS değişkenleri ile tema yönetimi

## Ana Bileşenler
- [x] İnce Header bileşeni
- [x] JSON Editor bileşeni (Monaco Editor)
- [x] İşlem butonları Toolbar'ı
- [x] Ayarlar modal/dropdown (Header içinde entegre)
- [x] Fullscreen container

## JSON İşlemleri
- [x] JSON biçimlendirme (format/beautify)
- [x] JSON sıkıştırma (minify/compress)
- [x] JSON nesneleştirme/parse etme
- [x] Sözdizimi doğrulama ve hata gösterimi

## Dosya ve Pano İşlemleri
- [x] Kopyalama fonksiyonu
- [x] Yapıştırma fonksiyonu
- [x] JSON dosyası indirme
- [x] Dosya yükleme/import

## PWA Desteği
- [x] manifest.json oluşturma
- [x] Uygulama ikonları (72, 96, 128, 144, 152, 192, 384, 512)
- [ ] next-pwa ile Service Worker yapılandırması (opsiyonel)

## Oturum ve Ayar Yönetimi
- [x] Son JSON içeriğini hatırlama
- [x] Kullanıcı tercihlerini saklama
- [x] Oturum yönetimi için custom hook

## Responsive ve UX
- [x] Mobil uyumlu tasarım
- [x] Loading ve geçiş animasyonları
- [x] Hata mesajları ve bildirimler (Toast sistemi)
- [x] Klavye kısayolları

## Klavye Kısayolları
| Kısayol | İşlev |
|---------|-------|
| Ctrl+Shift+F | Biçimlendir |
| Ctrl+Shift+M | Sıkıştır |
| Ctrl+S | İndir |
| Ctrl+Shift+C | Kopyala |
| Ctrl+Shift+X | Temizle |
| F11 | Tam Ekran |
| Escape | Tam Ekrandan Çık |
