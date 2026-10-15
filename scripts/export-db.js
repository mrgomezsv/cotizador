const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cotizador';
const DATA_DIR = path.join(__dirname, '..', 'data');

async function exportDatabase() {
  try {
    console.log('🔄 Conectando a MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión exitosa.');

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const collections = ['cotizacions', 'clientes'];

    for (const colName of collections) {
      const collection = mongoose.connection.collection(colName);
      const docs = await collection.find({}).toArray();
      const filePath = path.join(DATA_DIR, `${colName}.json`);

      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf-8');
      console.log(`📦 Exportados ${docs.length} registros de "${colName}" en ${filePath}`);
    }

    await mongoose.disconnect();
    console.log('🎉 ¡Base de datos exportada con éxito en la carpeta /data!');
  } catch (error) {
    console.error('❌ Error al exportar base de datos:', error);
    process.exit(1);
  }
}

exportDatabase();
