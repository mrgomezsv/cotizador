const mongoose = require('mongoose');
const Cotizacion = require('../models/Cotizacion');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cotizador');

const insertCotizaciones = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    // Datos de la primera cotización
    const cotizacion1 = {
      cliente: 'ZONA FRANCA MIRAMAR',
      direccion: 'ZONA FRANCA MIRAMAR',
      telefono: '7844-2446',
      fecha: '2025-11-11',
      cheque: '',
      nit: '',
      pago: '',
      firmaEmpresa: 'Tec. Ing. Mario Roberto Gomez Martinez',
      items: [
        {
          desc: 'MANTENIMIENTO DE GABINETE PRINCIPAL (OFICINA ADMINISTRATIVA)',
          qty: 1,
          unit: 210.00,
          total: 210.00
        },
        {
          desc: 'MANTENIMIENTO DE GABINETE SECUNDARIO (ADUANA)',
          qty: 1,
          unit: 200.00,
          total: 200.00
        }
      ],
      subTotal: 410.00,
      iva: 0.00,
      total: 410.00,
      calcularIva: false,
      status: 'draft',
      createdAt: new Date('2025-11-11'),
      updatedAt: new Date('2025-11-11')
    };

    // Datos de la segunda cotización
    const cotizacion2 = {
      cliente: 'ZONA FRANCA MIRAMAR',
      direccion: 'ZONA FRANCA MIRAMAR',
      telefono: '7844-2446',
      fecha: '2025-11-11',
      cheque: '',
      nit: '',
      pago: '',
      firmaEmpresa: 'Tec. Ing. Mario Roberto Gomez Martinez',
      items: [
        {
          desc: 'MANTENIMIENTO PREVENTIVO EQUIPOS DESKTOP (OFICINA)',
          qty: 3,
          unit: 18.00,
          total: 54.00
        },
        {
          desc: 'MANTENIMIENTO PREVENTIVO EQUIPOS LAPTOPS (OFICINA)',
          qty: 2,
          unit: 18.00,
          total: 36.00
        },
        {
          desc: 'MANTENIMIENTO PREVENTIVO IMPRESORES (OFICINA ADMINISTRATIVA)',
          qty: 1,
          unit: 23.00,
          total: 23.00
        },
        {
          desc: 'MANTENIMIENTO PREVENTIVO EQUIPOS DESKTOP (ADUANA)',
          qty: 6,
          unit: 18.00,
          total: 108.00
        },
        {
          desc: 'MANTENIMIENTO PREVENTIVO EQUIPOS LAPTOPS (CLINICA)',
          qty: 1,
          unit: 18.00,
          total: 18.00
        },
        {
          desc: 'MANTENIMIENTO PREVENTIVO SERVIDOR DELL T40',
          qty: 1,
          unit: 65.00,
          total: 65.00
        }
      ],
      subTotal: 304.00,
      iva: 0.00,
      total: 304.00,
      calcularIva: false,
      status: 'draft',
      createdAt: new Date('2025-11-11'),
      updatedAt: new Date('2025-11-11')
    };

    // Limpiar cotizaciones existentes con estos datos (opcional)
    console.log('🧹 Limpiando cotizaciones duplicadas...');
    await Cotizacion.deleteMany({ 
      cliente: 'ZONA FRANCA MIRAMAR',
      fecha: '2025-11-11'
    });

    // Insertar las cotizaciones
    console.log('📝 Insertando cotizaciones...');
    const saved1 = await Cotizacion.create(cotizacion1);
    const saved2 = await Cotizacion.create(cotizacion2);

    console.log('✅ Cotizaciones insertadas exitosamente:');
    console.log(`   - Cotización 1: ${saved1._id} - Total: $${saved1.total}`);
    console.log(`   - Cotización 2: ${saved2._id} - Total: $${saved2.total}`);
    
    // Contar total de cotizaciones
    const total = await Cotizacion.countDocuments();
    console.log(`\n📊 Total de cotizaciones en la base de datos: ${total}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error insertando cotizaciones:', error);
    process.exit(1);
  }
};

insertCotizaciones();

