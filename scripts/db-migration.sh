#!/bin/bash

# Configuration
DB_NAME="cotizador"
DUMP_DIR="./db-dump"

echo "🚀 Iniciando exportación de base de datos local..."

# 1. Crear backup de la DB local
if command -v mongodump &> /dev/null; then
    mongodump --db $DB_NAME --out $DUMP_DIR
    echo "✅ Backup local creado en $DUMP_DIR"
else
    echo "❌ Error: mongodump no está instalado en el sistema local."
    exit 1
fi

echo ""
echo "📝 Instrucciones para importar en Docker:"
echo "1. Inicia los contenedores: docker-compose up -d"
echo "2. Copia el dump al contenedor: docker cp $DUMP_DIR/cotizador cotizador-db:/tmp/dump"
echo "3. Importa los datos: docker exec -it cotizador-db mongorestore --db cotizador /tmp/dump"
echo "4. Limpia el contenedor: docker exec -it cotizador-db rm -rf /tmp/dump"

echo ""
echo "🎉 ¡Proceso de exportación completado!"
