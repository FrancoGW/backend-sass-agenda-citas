const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { auth, isAdmin } = require('../middleware/auth.middleware');

// Validaciones
const profileValidation = [
  body('name').optional().trim().notEmpty().withMessage('El nombre es requerido'),
  body('phone').optional().trim(),
  body('businessName').optional().trim(),
  body('businessDescription').optional().trim(),
  body('businessAddress').optional().trim()
];

// Rutas públicas
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, profileValidation, userController.updateProfile);

// Rutas de administrador
router.get('/', auth, isAdmin, userController.listUsers);
router.put('/:userId/status', auth, isAdmin, userController.updateUserStatus);
router.get('/stats', auth, isAdmin, userController.getUserStats);

module.exports = router; 