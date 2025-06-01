const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const appointmentController = require('../controllers/appointment.controller');
const { auth, isAdmin } = require('../middleware/auth.middleware');

// Validaciones
const appointmentValidation = [
  body('businessId').notEmpty().withMessage('El ID del negocio es requerido'),
  body('client.name').notEmpty().withMessage('El nombre del cliente es requerido'),
  body('client.email').isEmail().withMessage('Email del cliente inválido'),
  body('service.name').notEmpty().withMessage('El nombre del servicio es requerido'),
  body('service.duration').isNumeric().withMessage('La duración debe ser un número'),
  body('service.price').isNumeric().withMessage('El precio debe ser un número'),
  body('date').isISO8601().withMessage('Fecha inválida')
];

// Rutas públicas
router.get('/availability', appointmentController.checkAvailability);

// Rutas autenticadas
router.post('/', auth, appointmentValidation, appointmentController.createAppointment);
router.get('/', auth, appointmentController.listAppointments);
router.put('/:appointmentId/status', auth, appointmentController.updateAppointmentStatus);

// Rutas de administrador
router.get('/stats', auth, isAdmin, appointmentController.getAppointmentStats);

module.exports = router; 