# Backend del Cotizador

Backend Node.js/Express con MongoDB para gestionar las cotizaciones.

## Configuración

### 1. Instalar dependencias

```bash
cd server
npm install
```

### 2. Configurar MongoDB

Crea un archivo `.env` en la carpeta `server` con el siguiente contenido:

```
MONGODB_URI=mongodb://localhost:27017/cotizador
PORT=3000
NODE_ENV=development
```

**Nota:** Si tu MongoDB está en otra ubicación o usa autenticación, actualiza `MONGODB_URI` según corresponda.

### 3. Iniciar MongoDB

Asegúrate de que MongoDB esté corriendo. Si lo instalaste localmente:

```bash
# En macOS con Homebrew
brew services start mongodb-community

# O iniciar manualmente
mongod
```

### 4. Iniciar el servidor

```bash
# Modo desarrollo (con nodemon para auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints disponibles

- `GET /api/health` - Verificar estado del servidor
- `GET /api/cotizaciones` - Obtener todas las cotizaciones
- `GET /api/cotizaciones/filtered` - Obtener cotizaciones con filtros (status, page, limit)
- `GET /api/cotizaciones/:id` - Obtener una cotización específica
- `POST /api/cotizaciones` - Crear una nueva cotización
- `PUT /api/cotizaciones/:id` - Actualizar una cotización
- `PATCH /api/cotizaciones/:id/status` - Cambiar estado de una cotización
- `GET /api/cotizaciones/:id/status-history` - Obtener historial de estados
- `DELETE /api/cotizaciones/:id` - Eliminar una cotización

## Estructura del proyecto

```
server/
├── config/
│   └── database.js      # Configuración de conexión a MongoDB
├── models/
│   └── Cotizacion.js   # Modelo de datos de Cotización
├── routes/
│   └── cotizaciones.js  # Rutas API para cotizaciones
├── .env                 # Variables de entorno (no versionado)
├── .env.example         # Ejemplo de variables de entorno
├── server.js            # Archivo principal del servidor
└── package.json         # Dependencias del proyecto
```

