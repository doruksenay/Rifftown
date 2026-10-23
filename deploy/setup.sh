#!/usr/bin/env bash
# Rifftown sunucusunu temiz bir Ubuntu 22.04/24.04 sunucuya kurar.
# Kullanım (sunucuda, proje klasörünün içindeyken):
#   sudo bash deploy/setup.sh api.ornekoyun.com
set -euo pipefail

DOMAIN="${1:-}"
if [[ -z "$DOMAIN" ]]; then
  echo "Kullanım: sudo bash deploy/setup.sh <alan-adı>   (ör. api.ornekoyun.com)"
  exit 1
fi
if [[ $EUID -ne 0 ]]; then
  echo "Bu betik yönetici yetkisiyle çalışmalı: sudo bash deploy/setup.sh $DOMAIN"
  exit 1
fi

cd "$(dirname "$0")"
DEPLOY_DIR="$(pwd)"

echo "==> Docker kuruluyor (yoksa)"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

echo "==> Güvenlik duvarı: sadece SSH, HTTP ve HTTPS açık"
if command -v ufw >/dev/null 2>&1; then
  ufw allow OpenSSH >/dev/null
  ufw allow 80/tcp >/dev/null
  ufw allow 443/tcp >/dev/null
  ufw --force enable >/dev/null
fi

echo "==> Ayar dosyası (.env)"
if [[ ! -f .env ]]; then
  DB_PASSWORD="$(openssl rand -hex 24)"
  WEBHOOK_SECRET="$(openssl rand -hex 24)"
  cat > .env <<EOF
DOMAIN=$DOMAIN
DB_PASSWORD=$DB_PASSWORD
GAME_SPEED=1
EXPO_ACCESS_TOKEN=
REVENUECAT_WEBHOOK_SECRET=$WEBHOOK_SECRET
CONTACT_EMAIL=destek@$DOMAIN
EOF
  chmod 600 .env
  echo "    .env oluşturuldu (veritabanı şifresi rastgele üretildi)."
else
  sed -i "s/^DOMAIN=.*/DOMAIN=$DOMAIN/" .env
  if ! grep -q '^REVENUECAT_WEBHOOK_SECRET=.' .env; then
    sed -i '/^REVENUECAT_WEBHOOK_SECRET=/d' .env
    echo "REVENUECAT_WEBHOOK_SECRET=$(openssl rand -hex 24)" >> .env
  fi
  grep -q '^CONTACT_EMAIL=' .env || echo "CONTACT_EMAIL=destek@$DOMAIN" >> .env
  echo "    Mevcut .env korundu, alan adı güncellendi."
fi

echo "==> Servisler derleniyor ve başlatılıyor"
docker compose up -d --build

echo "==> Günlük yedekleme (her gece 04:00)"
chmod +x "$DEPLOY_DIR/backup.sh"
CRON_LINE="0 4 * * * $DEPLOY_DIR/backup.sh >> $DEPLOY_DIR/backups/backup.log 2>&1"
mkdir -p "$DEPLOY_DIR/backups"
( crontab -l 2>/dev/null | grep -v "$DEPLOY_DIR/backup.sh" ; echo "$CRON_LINE" ) | crontab -

echo "==> Sağlık kontrolü"
for i in $(seq 1 30); do
  if docker compose exec -T api node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
    echo ""
    echo "Kurulum tamam."
    echo "  API:            https://$DOMAIN/api/config"
    echo "  Yönetim paneli: https://$DOMAIN/admin"
    echo ""
    echo "  Mağaza bildirim adresi: https://$DOMAIN/api/webhooks/revenuecat"
    echo "  Bildirim anahtarı (RevenueCat'e yazılacak): $(grep ^REVENUECAT_WEBHOOK_SECRET= .env | cut -d= -f2)"
    echo ""
    echo "Kendini yönetici yapmak için önce uygulamadan kayıt ol, sonra:"
    echo "  cd $DEPLOY_DIR && docker compose exec api node dist/make-admin.js <e-postan>"
    exit 0
  fi
  sleep 2
done
echo "API 60 saniye içinde yanıt vermedi. Kayıtlara bak: cd $DEPLOY_DIR && docker compose logs api"
exit 1
