#!/bin/bash

# Script de backup para GymPro
# Uso: ./scripts/backup.sh

BACKUP_DIR="/var/www/backups"
DB_PATH="/var/www/gympro/db/custom.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/gympro-backup-$DATE.db"

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

# Crear backup
if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "$BACKUP_FILE"
    echo "✅ Backup creado: $BACKUP_FILE"
    
    # Comprimir backup
    gzip "$BACKUP_FILE"
    echo "✅ Backup comprimido: $BACKUP_FILE.gz"
    
    # Eliminar backups mayores a 30 días
    find $BACKUP_DIR -name "gympro-backup-*.db.gz" -mtime +30 -delete
    echo "✅ Backups antiguos eliminados (>30 días)"
else
    echo "❌ No se encontró la base de datos en $DB_PATH"
    exit 1
fi
