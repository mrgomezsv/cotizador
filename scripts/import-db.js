const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cotizador';
const DATA_DIR = path.join(__dirname, '..', 'data');

async function importDatabase() {
  try {
    console.log('🔄 Conectando a MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión exitosa.');

    const collections = ['cotizacions', 'clientes'];

    for (const colName of collections) {
      const filePath = path.join(DATA_DIR, `${colName}.json`);

      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Archivo ${filePath} no encontrado, saltando...`);
        continue;
      }

      const rawData = fs.readFileSync(filePath, 'utf-8');
      const docs = JSON.parse(rawData);

      if (!Array.isArray(docs) || docs.length === 0) {
        console.log(`ℹ️ No hay registros para importar en "${colName}".`);
        continue;
      }

      const collection = mongoose.connection.collection(colName);

      let importedCount = 0;
      for (const doc of docs) {
        // Convertir _id de string a ObjectId
        if (doc._id) {
          doc._id = new mongoose.Types.ObjectId(doc._id);
        }
        // Convertir campos de fecha si existen
        if (doc.createdAt) doc.createdAt = new Date(doc.createdAt);
        if (doc.updatedAt) doc.updatedAt = new Date(doc.updatedAt);

        await collection.replaceOne({ _id: doc._id }, doc, { upsert: true });
        importedCount++;
      }

      console.log(`✅ Importados/Restaurados ${importedCount} registros en la colección "${colName}".`);
    }

    await mongoose.disconnect();
    console.log('🎉 ¡Base de datos restaurada exitosamente en tu MongoDB local!');
  } catch (error) {
    console.error('❌ Error al importar base de datos:', error);
    process.exit(1);
  }
}

importDatabase();
