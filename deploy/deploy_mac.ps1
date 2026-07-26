# ============================================
# JSON Formatter Deployment Script (PowerShell)
# ============================================
# Bu script Next.js projesini build edip sunucuya deploy eder
# - Node.js kurulum kontrolü (sunucu ve lokal)
# - Next.js static export (npm run build)
# - Nginx kurulumu ve yapılandırması
# - SSL sertifikası (Let's Encrypt)
# - Diğer sitelere dokunmaz
# Kullanım: .\deploy.ps1
# ============================================

$ErrorActionPreference = "Stop"
$startTime = Get-Date

# ═══════════════════════════════════════════════════════════
# RENK VE FORMAT FONKSİYONLARI
# ═══════════════════════════════════════════════════════════
function Write-Header {
    param([string]$text)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "  $text" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
}

function Write-Step {
    param([string]$step, [string]$text)
    Write-Host ""
    Write-Host "┌─────────────────────────────────────────────────────────────" -ForegroundColor Cyan
    Write-Host "│ [$step] $text" -ForegroundColor Cyan
    Write-Host "└─────────────────────────────────────────────────────────────" -ForegroundColor Cyan
}

function Write-SubStep {
    param([string]$text)
    Write-Host "    → $text" -ForegroundColor Gray
}

function Write-Success {
    param([string]$text)
    Write-Host "    ✓ $text" -ForegroundColor Green
}

function Write-Warning {
    param([string]$text)
    Write-Host "    ⚠ $text" -ForegroundColor Yellow
}

function Write-Failure {
    param([string]$text)
    Write-Host "    ✗ $text" -ForegroundColor Red
}

function Write-Detail {
    param([string]$label, [string]$value)
    Write-Host "    │ " -NoNewline -ForegroundColor DarkGray
    Write-Host "$label`: " -NoNewline -ForegroundColor DarkCyan
    Write-Host "$value" -ForegroundColor White
}

function Get-ElapsedTime {
    param([datetime]$start)
    $elapsed = (Get-Date) - $start
    return "{0:mm}:{0:ss}" -f $elapsed
}

# ═══════════════════════════════════════════════════════════
# SUNUCU AYARLARI
# ═══════════════════════════════════════════════════════════
$SERVER = "root@92.113.21.90"
$REMOTE_PATH = "/var/www/json-formatter"
$BUILD_ARCHIVE = "json-formatter-build.tar.gz"
$DOMAIN = "jsonformat.info"
$APP_URL = "https://$DOMAIN"
$SOURCE_DIR = "$PSScriptRoot/../src"  # Next.js proje klasörü
$BUILD_OUTPUT = "$PSScriptRoot/../src/out"  # Next.js static export çıktısı
$ADMIN_EMAIL = "admin@$DOMAIN"  # SSL sertifikası için e-posta
$NGINX_CONFIG_PATH = "/etc/nginx/sites-available/$DOMAIN"
$NGINX_ENABLED_PATH = "/etc/nginx/sites-enabled/$DOMAIN"

# ═══════════════════════════════════════════════════════════
# HEADER
# ═══════════════════════════════════════════════════════════
Clear-Host
Write-Host ""
Write-Host "       _ ____   ___  _   _   _____ ___  ____  __  __    _  _____ " -ForegroundColor Yellow
Write-Host "      | / ___| / _ \| \ | | |  ___/ _ \|  _ \|  \/  |  / \|_   _|" -ForegroundColor Yellow
Write-Host "   _  | \___ \| | | |  \| | | |_ | | | | |_) | |\/| | / _ \ | |  " -ForegroundColor Yellow
Write-Host "  | |_| |___) | |_| | |\  | |  _|| |_| |  _ <| |  | |/ ___ \| |  " -ForegroundColor Yellow
Write-Host "   \___/|____/ \___/|_| \_| |_|   \___/|_| \_\_|  |_/_/   \_\_|  " -ForegroundColor Yellow
Write-Host "                    STATIC SITE DEPLOYMENT                       " -ForegroundColor DarkYellow
Write-Host ""

Write-Header "DEPLOYMENT BAŞLATILIYOR"
Write-Detail "Tarih" (Get-Date -Format "dd MMMM yyyy, HH:mm:ss")
Write-Detail "Sunucu" $SERVER
Write-Detail "Hedef Klasör" $REMOTE_PATH
Write-Detail "Domain" $DOMAIN
Write-Detail "Uygulama" $APP_URL
Write-Host ""

# ═══════════════════════════════════════════════════════════
# ADIM 1: KAYNAK DOSYA KONTROLÜ
# ═══════════════════════════════════════════════════════════
Write-Step "1-10" "Ön Gereksinimler Kontrol Ediliyor"

# Next.js proje klasörü kontrolü
if (-not (Test-Path $SOURCE_DIR)) {
    Write-Failure "Proje klasörü bulunamadı: $SOURCE_DIR"
    exit 1
}
Write-Success "Proje klasörü mevcut: $SOURCE_DIR"

# package.json kontrolü
if (-not (Test-Path "$SOURCE_DIR/package.json")) {
    Write-Failure "package.json bulunamadı!"
    exit 1
}
Write-Success "package.json mevcut"

# SSH baglantisi kontrolu
Write-SubStep "SSH baglantisi kontrol ediliyor..."
try {
    $sshTest = ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SERVER "echo OK" 2>&1
    if ($sshTest -ne "OK") {
        Write-Failure "SSH baglantisi kurulamadi!"
        exit 1
    }
    Write-Success "SSH baglantisi basarili"
}
catch {
    Write-Failure "SSH baglantisi basarisiz: $($_.Exception.Message)"
    exit 1
}

# ═══════════════════════════════════════════════════════════
# ADIM 2: NODE.JS KURULUM KONTROLÜ (LOKAL)
# ═══════════════════════════════════════════════════════════
Write-Step "2-10" "Node.js Kurulum Kontrolü (Lokal)"

# Node.js kurulu mu?
$nodeVersion = $null
try {
    $nodeVersion = node --version 2>$null
}
catch {
    $nodeVersion = $null
}

if (-not $nodeVersion) {
    Write-Failure "Node.js kurulu değil!"
    Write-SubStep "Node.js'i https://nodejs.org adresinden indirip kurun."
    exit 1
}
Write-Success "Node.js kurulu: $nodeVersion"

# npm kurulu mu?
$npmVersion = $null
try {
    $npmVersion = npm --version 2>$null
}
catch {
    $npmVersion = $null
}

if (-not $npmVersion) {
    Write-Failure "npm kurulu değil!"
    exit 1
}
Write-Success "npm kurulu: v$npmVersion"

# ═══════════════════════════════════════════════════════════
# ADIM 3: NEXT.JS BUILD
# ═══════════════════════════════════════════════════════════
Write-Step "3-10" "Next.js Build İşlemi"

# node_modules kontrolü ve npm install
if (-not (Test-Path "$SOURCE_DIR/node_modules")) {
    Write-SubStep "node_modules bulunamadı, npm install çalıştırılıyor..."
    Push-Location $SOURCE_DIR
    npm install
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Failure "npm install başarısız!"
        exit 1
    }
    Pop-Location
    Write-Success "Bağımlılıklar yüklendi"
}
else {
    Write-Success "node_modules mevcut"
}

# Önceki build çıktısını temizle
if (Test-Path $BUILD_OUTPUT) {
    Write-SubStep "Önceki build çıktısı temizleniyor..."
    Remove-Item -Recurse -Force $BUILD_OUTPUT
}

# Next.js build
Write-SubStep "Next.js build başlatılıyor..."
$buildStart = Get-Date

Push-Location $SOURCE_DIR
npm run build
$buildExitCode = $LASTEXITCODE
Pop-Location

if ($buildExitCode -ne 0) {
    Write-Failure "Next.js build başarısız!"
    exit 1
}

$buildDuration = ((Get-Date) - $buildStart).TotalSeconds
$buildDurationRounded = [math]::Round($buildDuration, 1)
Write-Success ("Build tamamlandi (" + $buildDurationRounded + " saniye)")

# Build ciktisi kontrolu
if (-not (Test-Path $BUILD_OUTPUT)) {
    Write-Failure "Build ciktisi bulunamadi: $BUILD_OUTPUT"
    Write-SubStep "next.config dosyasinda 'output: export' ayari yapildigindan emin olun."
    exit 1
}

# index.html kontrolu (static export)
if (-not (Test-Path "$BUILD_OUTPUT/index.html")) {
    Write-Failure "Static export basarisiz - index.html bulunamadi!"
    Write-SubStep "next.config dosyasinda 'output: export' ayari yapildigindan emin olun."
    exit 1
}

$fileCount = (Get-ChildItem -Recurse $BUILD_OUTPUT -File).Count
$totalSize = (Get-ChildItem -Recurse $BUILD_OUTPUT -File | Measure-Object -Property Length -Sum).Sum / 1MB
$totalSizeRounded = [math]::Round($totalSize, 2)
Write-Success ("Build ciktisi hazir (" + $fileCount + " dosya, " + $totalSizeRounded + " MB)")

# ═══════════════════════════════════════════════════════════
# ADIM 4: ARSIVLEME
# ═══════════════════════════════════════════════════════════
Write-Step "4-10" "Dosyalar Arsivleniyor"

$ARCHIVE_PATH = "$PSScriptRoot/$BUILD_ARCHIVE"

# Önceki arşivi temizle
if (Test-Path $ARCHIVE_PATH) {
    Remove-Item $ARCHIVE_PATH -Force
}

# Tüm dosyaları arşivle (build output klasöründen)
Push-Location $BUILD_OUTPUT
tar -czf $ARCHIVE_PATH .
Pop-Location

if ($LASTEXITCODE -ne 0) {
    Write-Failure "Arsivleme basarisiz!"
    exit 1
}

$archiveSize = (Get-Item $ARCHIVE_PATH).Length / 1MB
$archiveSizeRounded = [math]::Round($archiveSize, 2)
Write-Success "Arsiv olusturuldu ($archiveSizeRounded MB)"

# ═══════════════════════════════════════════════════════════
# ADIM 5: SUNUCU ÖN HAZIRLIK
# ═══════════════════════════════════════════════════════════
Write-Step "5-10" "Sunucu Hazırlanıyor"

# Nginx kurulu mu kontrol et ve gerekirse kur
$nginxStatus = ssh -o StrictHostKeyChecking=no $SERVER "command -v nginx > /dev/null 2>&1 && echo NGINX_INSTALLED || echo NGINX_NOT_INSTALLED"

if ($nginxStatus -eq "NGINX_NOT_INSTALLED") {
    Write-Warning "Nginx kurulu değil, kuruluyor..."
    
    ssh -o StrictHostKeyChecking=no $SERVER "apt-get update && apt-get install -y nginx certbot python3-certbot-nginx && systemctl enable nginx && systemctl start nginx"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Failure "Nginx kurulumu başarısız!"
        exit 1
    }
    Write-Success "Nginx kuruldu ve başlatıldı"
}
else {
    Write-Success "Nginx zaten kurulu"
    
    # Certbot kurulu mu kontrol et
    $certbotStatus = ssh -o StrictHostKeyChecking=no $SERVER "command -v certbot > /dev/null 2>&1 && echo CERTBOT_INSTALLED || echo CERTBOT_NOT_INSTALLED"
    if ($certbotStatus -eq "CERTBOT_NOT_INSTALLED") {
        Write-SubStep "Certbot kuruluyor..."
        ssh -o StrictHostKeyChecking=no $SERVER "apt-get update && apt-get install -y certbot python3-certbot-nginx"
    }
}

# Hedef klasörü oluştur
ssh -o StrictHostKeyChecking=no $SERVER "mkdir -p $REMOTE_PATH && chown -R www-data:www-data $REMOTE_PATH"
Write-Success "Hedef klasör hazırlandı: $REMOTE_PATH"

# ═══════════════════════════════════════════════════════════
# ADIM 6: SUNUCUYA YÜKLEME
# ═══════════════════════════════════════════════════════════
Write-Step "6-10" "Sunucuya Yukleniyor"
Write-SubStep "Transfer basliyor (arsiv boyutu: $archiveSizeRounded MB)..."

$uploadStart = Get-Date
scp -o StrictHostKeyChecking=no $ARCHIVE_PATH ${SERVER}:${REMOTE_PATH}/

if ($LASTEXITCODE -ne 0) {
    Write-Failure "Sunucuya yukleme basarisiz!"
    Remove-Item $ARCHIVE_PATH -ErrorAction SilentlyContinue
    exit 1
}

$uploadEnd = Get-Date
$uploadDuration = ($uploadEnd - $uploadStart).TotalSeconds
$uploadSpeed = $archiveSize / $uploadDuration
Write-Success "Sunucuya yuklendi"
Write-Detail "Sure" "$([math]::Round($uploadDuration, 1)) saniye"
Write-Detail "Hiz" "$([math]::Round($uploadSpeed, 2)) MB/s"

# Yerel arsivi temizle
Remove-Item $ARCHIVE_PATH
Write-Success "Yerel arsiv temizlendi"

# ═══════════════════════════════════════════════════════════
# ADIM 7: DOSYALARI ÇIKART
# ═══════════════════════════════════════════════════════════
Write-Step "7-10" "Dosyalar Çıkartılıyor"

ssh -o StrictHostKeyChecking=no $SERVER "cd $REMOTE_PATH && tar -xzf $BUILD_ARCHIVE && rm $BUILD_ARCHIVE && chown -R www-data:www-data $REMOTE_PATH"

if ($LASTEXITCODE -ne 0) {
    Write-Failure "Dosya çıkartma başarısız!"
    exit 1
}
Write-Success "Dosyalar çıkartıldı ve izinler ayarlandı"

# ═══════════════════════════════════════════════════════════
# ADIM 8: NGINX YAPILANDIRMASI
# ═══════════════════════════════════════════════════════════
Write-Step "8-10" "Nginx Yapilandiriliyor"

# SSL sertifikasi var mi kontrol et
$sslCheck = ssh -o StrictHostKeyChecking=no $SERVER "test -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem && echo SSL_EXISTS || echo SSL_NOT_EXISTS"

# Lokal nginx config dosyalari olustur
$NGINX_INITIAL_FILE = "$PSScriptRoot/nginx-initial.conf"
$NGINX_SSL_FILE = "$PSScriptRoot/nginx-ssl.conf"

$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# Initial config (HTTP only)
$initialConfig = @"
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    root $REMOTE_PATH;
    index index.html;

    location / {
        try_files `$uri `$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)`$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
"@
[System.IO.File]::WriteAllText($NGINX_INITIAL_FILE, $initialConfig, $utf8NoBom)

# SSL config
$sslConfig = @"
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://`$host`$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name $DOMAIN www.$DOMAIN;
    root $REMOTE_PATH;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    location / {
        try_files `$uri `$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)`$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
"@
[System.IO.File]::WriteAllText($NGINX_SSL_FILE, $sslConfig, $utf8NoBom)

if ($sslCheck -eq "SSL_NOT_EXISTS") {
    Write-Warning "SSL sertifikasi bulunamadi, once HTTP config ile baslayacagiz..."
    
    # Gecici nginx config yukle (SSL olmadan)
    Write-SubStep "Gecici HTTP yapilandirmasi yukleniyor..."
    scp -o StrictHostKeyChecking=no $NGINX_INITIAL_FILE "${SERVER}:${NGINX_CONFIG_PATH}"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Failure "Nginx config yuklenemedi!"
        exit 1
    }
    
    # Symlink olustur
    ssh -o StrictHostKeyChecking=no $SERVER "ln -sf $NGINX_CONFIG_PATH $NGINX_ENABLED_PATH"
    
    # Nginx'i test et ve yeniden baslat
    ssh -o StrictHostKeyChecking=no $SERVER "nginx -t && systemctl reload nginx"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Failure "Nginx yapilandirmasi gecersiz!"
        exit 1
    }
    Write-Success "Gecici HTTP yapilandirmasi uygulandi"
    
    # SSL sertifikasi al
    Write-SubStep "Let's Encrypt SSL sertifikasi aliniyor..."
    Write-SubStep "Bu islem birkac dakika surebilir..."
    
    $certbotResult = ssh -o StrictHostKeyChecking=no $SERVER "certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $ADMIN_EMAIL --redirect 2>&1"
    Write-Host $certbotResult -ForegroundColor DarkGray
    
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Certbot nginx plugin basarisiz, webroot metodu deneniyor..."
        
        # Certbot webroot ile dene
        ssh -o StrictHostKeyChecking=no $SERVER "certbot certonly --webroot -w $REMOTE_PATH -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $ADMIN_EMAIL"
        
        if ($LASTEXITCODE -ne 0) {
            Write-Failure "SSL sertifikasi alinamadi!"
            Write-SubStep "DNS ayarlarini kontrol edin. Site HTTP uzerinden calismaya devam edecek."
        }
        else {
            Write-Success "SSL sertifikasi alindi (webroot metodu)"
            
            # Tam SSL config uygula
            Write-SubStep "HTTPS yapilandirmasi uygulaniyor..."
            scp -o StrictHostKeyChecking=no $NGINX_SSL_FILE "${SERVER}:${NGINX_CONFIG_PATH}"
            ssh -o StrictHostKeyChecking=no $SERVER "nginx -t && systemctl reload nginx"
            Write-Success "HTTPS yapilandirmasi aktiflestirildi"
        }
    }
    else {
        Write-Success "SSL sertifikasi alindi ve yapilandirildi (certbot nginx plugin)"
    }
}
else {
    Write-Success "SSL sertifikasi zaten mevcut"
    
    # SSL config'i guncelle
    Write-SubStep "Nginx yapilandirmasi guncelleniyor..."
    scp -o StrictHostKeyChecking=no $NGINX_SSL_FILE "${SERVER}:${NGINX_CONFIG_PATH}"
    
    ssh -o StrictHostKeyChecking=no $SERVER "ln -sf $NGINX_CONFIG_PATH $NGINX_ENABLED_PATH && nginx -t && systemctl reload nginx"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Failure "Nginx yapilandirmasi gecersiz!"
        exit 1
    }
    Write-Success "Nginx yapilandirmasi guncellendi"
}

# ═══════════════════════════════════════════════════════════
# ADIM 9: SSL SERTİFİKA YENİLEME CRON
# ═══════════════════════════════════════════════════════════
Write-Step "9-10" "SSL Sertifika Yenileme Cron Kontrolü"

$cronCheck = ssh -o StrictHostKeyChecking=no $SERVER "crontab -l 2>/dev/null | grep -c certbot || echo 0"

if ($cronCheck -eq "0") {
    Write-SubStep "Otomatik sertifika yenileme cron'u ekleniyor..."
    
    # Mevcut cron'ları al ve certbot ekle
    ssh -o StrictHostKeyChecking=no $SERVER 'echo "0 3,15 * * * certbot renew --quiet && systemctl reload nginx" >> /etc/cron.d/certbot-renew'
    
    Write-Success "Otomatik sertifika yenileme cron'u eklendi"
}
else {
    Write-Success "Sertifika yenileme cron'u zaten mevcut"
}

# ═══════════════════════════════════════════════════════════
# ADIM 10: SAĞLIK KONTROLÜ
# ═══════════════════════════════════════════════════════════
Write-Step "10-10" "Sağlık Kontrolü Yapılıyor"
Write-SubStep "Nginx'in başlaması için 3 saniye bekleniyor..."
Start-Sleep -Seconds 3

# Önce HTTP kontrolü
try {
    $httpResponse = Invoke-WebRequest -Uri "http://$DOMAIN" -TimeoutSec 10 -UseBasicParsing -MaximumRedirection 0 -ErrorAction SilentlyContinue
    if ($httpResponse.StatusCode -eq 301 -or $httpResponse.StatusCode -eq 302) {
        Write-Success "HTTP -> HTTPS yönlendirmesi çalışıyor"
    }
}
catch {
    # Yönlendirme beklenen davranış
    if ($_.Exception.Response.StatusCode.value__ -eq 301 -or $_.Exception.Response.StatusCode.value__ -eq 302) {
        Write-Success "HTTP -> HTTPS yönlendirmesi çalışıyor"
    }
}

# HTTPS kontrolü
try {
    $response = Invoke-WebRequest -Uri $APP_URL -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Success "HTTPS sitesi çalışıyor (HTTP $($response.StatusCode))"
    }
    else {
        Write-Warning "Beklenmeyen durum kodu: $($response.StatusCode)"
    }
}
catch {
    # SSL henüz hazır değilse HTTP'yi kontrol et
    Write-Warning "HTTPS kontrolü başarısız, HTTP kontrol ediliyor..."
    try {
        $httpResponse = Invoke-WebRequest -Uri "http://$DOMAIN" -TimeoutSec 10 -UseBasicParsing
        if ($httpResponse.StatusCode -eq 200) {
            Write-Success "HTTP sitesi çalışıyor (HTTPS henüz hazır değil)"
        }
    }
    catch {
        Write-Warning "Sağlık kontrolü başarısız: $($_.Exception.Message)"
        Write-SubStep "Site henüz hazır olmayabilir, DNS propagation bekleyin"
    }
}

# ═══════════════════════════════════════════════════════════
# ÖZET
# ═══════════════════════════════════════════════════════════
$totalDuration = (Get-Date) - $startTime

Write-Host ""
Write-Host ""
Write-Host "  ╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║                                                           ║" -ForegroundColor Green
Write-Host "  ║          ✓ DEPLOYMENT BAŞARIYLA TAMAMLANDI!               ║" -ForegroundColor Green
Write-Host "  ║                                                           ║" -ForegroundColor Green
Write-Host "  ╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "  ┌─────────────────────────────────────────────────────────────" -ForegroundColor DarkGreen
Write-Host "  │ ÖZET" -ForegroundColor DarkGreen
Write-Host "  ├─────────────────────────────────────────────────────────────" -ForegroundColor DarkGreen
Write-Detail "Toplam Süre" ("{0:mm}:{0:ss}" -f $totalDuration)
Write-Detail "Build Süresi" "$([math]::Round($buildDuration, 1)) saniye"
Write-Detail "Arşiv Boyutu" "$([math]::Round($archiveSize, 2)) MB"
Write-Detail "Upload Süresi" "$([math]::Round($uploadDuration, 1)) saniye"
Write-Detail "Domain" $DOMAIN
Write-Host "  └─────────────────────────────────────────────────────────────" -ForegroundColor DarkGreen
Write-Host ""

Write-Host "  ┌─────────────────────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host "  │ FAYDALI KOMUTLAR" -ForegroundColor Cyan
Write-Host "  ├─────────────────────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host "    │ Siteyi Aç       : " -NoNewline -ForegroundColor DarkCyan
Write-Host $APP_URL -ForegroundColor White
Write-Host "    │ Nginx Durumu    : " -NoNewline -ForegroundColor DarkCyan
Write-Host "ssh $SERVER 'systemctl status nginx'" -ForegroundColor White
Write-Host "    │ Nginx Logları   : " -NoNewline -ForegroundColor DarkCyan
Write-Host "ssh $SERVER 'tail -f /var/log/nginx/error.log'" -ForegroundColor White
Write-Host "    │ SSL Durumu      : " -NoNewline -ForegroundColor DarkCyan
Write-Host "ssh $SERVER 'certbot certificates'" -ForegroundColor White
Write-Host "    │ SSL Yenile      : " -NoNewline -ForegroundColor DarkCyan
Write-Host "ssh $SERVER 'certbot renew --dry-run'" -ForegroundColor White
Write-Host "    │ Nginx Yeniden   : " -NoNewline -ForegroundColor DarkCyan
Write-Host "ssh $SERVER 'systemctl reload nginx'" -ForegroundColor White
Write-Host "  └─────────────────────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host ""

Write-Host "  ┌─────────────────────────────────────────────────────────────" -ForegroundColor Yellow
Write-Host "  │ ÖNEMLİ NOTLAR" -ForegroundColor Yellow
Write-Host "  ├─────────────────────────────────────────────────────────────" -ForegroundColor Yellow
Write-Host "    │ • DNS A kaydının $DOMAIN için sunucu IP'sine (92.113.21.90) " -ForegroundColor DarkYellow
Write-Host "    │   işaret ettiğinden emin olun" -ForegroundColor DarkYellow
Write-Host "    │ • www.$DOMAIN için de A kaydı veya CNAME gerekli" -ForegroundColor DarkYellow
Write-Host "    │ • SSL sertifikası otomatik olarak yenilenecek" -ForegroundColor DarkYellow
Write-Host "  └─────────────────────────────────────────────────────────────" -ForegroundColor Yellow
Write-Host ""
