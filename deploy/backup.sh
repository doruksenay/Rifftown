#!/usr/bin/env bash
# Veritabanının sıkıştırılmış yedeğini alır, son 14 günü tutar.
# Elle çalıştırmak için: bash deploy/backup.sh
# Geri yüklemek için:
#   gunzip -c backups/rifftown-TARİH.sql.gz | docker compose exec -T db psql -U rifftown -d rifftown
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p backups
STAMP="$(date +%Y-%m-%d_%H%M)"
docker compose exec -T db pg_dump -U rifftown -d rifftown --clean --if-exists | gzip > "backups/rifftown-$STAMP.sql.gz"
find backups -name 'rifftown-*.sql.gz' -mtime +14 -delete
echo "$(date) yedek alındı: backups/rifftown-$STAMP.sql.gz"
