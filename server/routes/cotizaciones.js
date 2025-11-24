const express = require('express');
const router = express.Router();
const Cotizacion = require('../models/Cotizacion');

// GET /api/cotizaciones - Obtener todas las cotizaciones
router.get('/', async (req, res) => {
  try {
    const cotizaciones = await Cotizacion.find().sort({ createdAt: -1 });
    res.json(cotizaciones);
  } catch (error) {
    console.error('Error obteniendo cotizaciones:', error);
    res.status(500).json({ error: 'Error al obtener las cotizaciones' });
  }
});

// GET /api/cotizaciones/filtered - Obtener cotizaciones con filtros
router.get('/filtered', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const cotizaciones = await Cotizacion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Cotizacion.countDocuments(query);
    
    res.json({
      data: cotizaciones,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo cotizaciones filtradas:', error);
    res.status(500).json({ error: 'Error al obtener las cotizaciones' });
  }
});

// GET /api/cotizaciones/:id - Obtener una cotización específica
router.get('/:id', async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id);
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    res.json(cotizacion);
  } catch (error) {
    console.error('Error obteniendo cotización:', error);
    res.status(500).json({ error: 'Error al obtener la cotización' });
  }
});

// POST /api/cotizaciones - Crear una nueva cotización
router.post('/', async (req, res) => {
  try {
    const cotizacionData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const cotizacion = new Cotizacion(cotizacionData);
    const savedCotizacion = await cotizacion.save();
    
    res.status(201).json(savedCotizacion);
  } catch (error) {
    console.error('Error creando cotización:', error);
    res.status(400).json({ error: 'Error al crear la cotización', details: error.message });
  }
});

// PUT /api/cotizaciones/:id - Actualizar una cotización
router.put('/:id', async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    res.json(cotizacion);
  } catch (error) {
    console.error('Error actualizando cotización:', error);
    res.status(400).json({ error: 'Error al actualizar la cotización', details: error.message });
  }
});

// PATCH /api/cotizaciones/:id/status - Cambiar estado de una cotización
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'El estado es requerido' });
    }
    
    const cotizacion = await Cotizacion.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    // Aquí podrías guardar el historial de estados si lo necesitas
    // Por ahora solo actualizamos el estado
    
    res.json(cotizacion);
  } catch (error) {
    console.error('Error cambiando estado:', error);
    res.status(400).json({ error: 'Error al cambiar el estado', details: error.message });
  }
});

// GET /api/cotizaciones/:id/status-history - Obtener historial de estados
router.get('/:id/status-history', async (req, res) => {
  try {
    // Por ahora retornamos un array vacío ya que no tenemos un modelo de historial
    // Puedes implementar esto más adelante si lo necesitas
    res.json([]);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error al obtener el historial' });
  }
});

// DELETE /api/cotizaciones/:id - Eliminar una cotización
router.delete('/:id', async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findByIdAndDelete(req.params.id);
    
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    res.json({ message: 'Cotización eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando cotización:', error);
    res.status(500).json({ error: 'Error al eliminar la cotización' });
  }
});

module.exports = router;

