const User = require('../models/user.model');
const { validationResult } = require('express-validator');

// Obtener perfil del usuario actual
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }
};

// Actualizar perfil del usuario
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, businessName, businessDescription, businessAddress, businessHours } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar campos del perfil
    user.profile = {
      ...user.profile,
      name,
      phone,
      businessName,
      businessDescription,
      businessAddress,
      businessHours
    };

    await user.save();
    res.json({ message: 'Perfil actualizado exitosamente', profile: user.profile });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
};

// Listar usuarios (solo admin)
exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { 'profile.name': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al listar usuarios', error: error.message });
  }
};

// Actualizar estado de usuario (solo admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ message: 'Estado de usuario actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estado de usuario', error: error.message });
  }
};

// Obtener estadísticas de usuarios (solo admin)
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const clientUsers = await User.countDocuments({ role: 'client' });

    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
    });

    res.json({
      totalUsers,
      activeUsers,
      adminUsers,
      clientUsers,
      newUsersLastMonth
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
}; 