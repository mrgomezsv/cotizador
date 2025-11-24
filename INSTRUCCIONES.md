# Instrucciones para conectar el proyecto a MongoDB

## 📋 Requisitos previos

1. **MongoDB instalado y corriendo**
   - Si no lo tienes instalado, puedes instalarlo con Homebrew: `brew install mongodb-community`
   - Iniciar MongoDB: `brew services start mongodb-community`

2. **Node.js instalado** (ya deberías tenerlo)

## 🚀 Pasos para configurar y ejecutar

### 1. Configurar el backend

```bash
# Navegar a la carpeta del servidor
cd server

# Instalar dependencias
npm install

# Crear archivo .env con la conexión a MongoDB
# Copia el contenido de .env.example y créalo como .env
# O crea manualmente un archivo .env con:
# MONGODB_URI=mongodb://localhost:27017/cotizador
# PORT=3000
# NODE_ENV=development
```

### 2. Iniciar MongoDB

Asegúrate de que MongoDB esté corriendo:

```bash
# Con Homebrew (macOS)
brew services start mongodb-community

# O iniciar manualmente
mongod
```

### 3. Iniciar el backend

En una terminal, desde la carpeta `server`:

```bash
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### 4. Iniciar el frontend

En otra terminal, desde la raíz del proyecto:

```bash
npm start
```

El frontend estará disponible en `http://localhost:4200`

## 🔧 Configuración de MongoDB

Si tu MongoDB está configurado de manera diferente (por ejemplo, con autenticación o en otro puerto), actualiza el archivo `server/.env`:

```env
MONGODB_URI=mongodb://usuario:password@localhost:27017/cotizador
PORT=3000
NODE_ENV=development
```

## ✅ Verificar que todo funciona

1. **Backend funcionando:**
   - Abre `http://localhost:3000/api/health` en tu navegador
   - Deberías ver: `{"status":"ok","message":"Servidor funcionando correctamente"}`

2. **Frontend conectado:**
   - Abre `http://localhost:4200`
   - Ve a la sección de cotizaciones
   - Intenta crear una nueva cotización
   - Debería guardarse en MongoDB

## 📊 Verificar datos en MongoDB

Puedes usar MongoDB Compass para ver los datos:

1. Abre MongoDB Compass
2. Conéctate a `mongodb://localhost:27017`
3. Selecciona la base de datos `cotizador`
4. Verás la colección `cotizaciones` con todas tus cotizaciones

## 🐛 Solución de problemas

### Error: "Cannot connect to MongoDB"
- Verifica que MongoDB esté corriendo: `brew services list` (macOS)
- Verifica la URI en `server/.env`
- Asegúrate de que el puerto 27017 esté disponible

### Error: "Port 3000 already in use"
- Cambia el puerto en `server/.env` a otro (ej: 3001)
- Actualiza el proxy en `proxy.conf.json` si cambias el puerto

### Las cotizaciones no se guardan
- Verifica que el backend esté corriendo
- Revisa la consola del navegador para errores
- Revisa los logs del backend en la terminal

## 📝 Notas importantes

- El backend debe estar corriendo antes de usar el frontend
- El proxy de Angular redirige todas las peticiones `/api/*` al backend en `localhost:3000`
- Los datos se guardan en la base de datos MongoDB `cotizador` en la colección `cotizaciones`

