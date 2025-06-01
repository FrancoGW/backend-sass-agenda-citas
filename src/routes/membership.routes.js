const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const membershipController = require('../controllers/membership.controller');
const { auth, isAdmin } = require('../middleware/auth.middleware');

// Validaciones
const membershipValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('description').trim().notEmpty().withMessage('La descripción es requerida'),
  body('price').isNumeric().withMessage('El precio debe ser un número'),
  body('duration').isNumeric().withMessage('La duración debe ser un número'),
  body('maxAppointments').isNumeric().withMessage('El máximo de citas debe ser un número'),
  body('maxClients').isNumeric().withMessage('El máximo de clientes debe ser un número')
];

// Rutas públicas
router.get('/', membershipController.listMemberships);
router.get('/:id', membershipController.getMembership);

// Rutas de administrador
router.post('/', auth, isAdmin, membershipValidation, membershipController.createMembership);
router.put('/:id', auth, isAdmin, membershipValidation, membershipController.updateMembership);
router.post('/assign', auth, isAdmin, membershipController.assignMembership);
router.get('/stats/revenue', auth, isAdmin, membershipController.getMembershipStats);

module.exports = router; 