const Membership = require('../models/membership.model');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');

// Crear nueva membresía (admin)
exports.createMembership = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const membership = new Membership(req.body);
    await membership.save();

    res.status(201).json({
      message: 'Membresía creada exitosamente',
      membership
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear membresía', error: error.message });
  }
};

// Listar todas las membresías
exports.listMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find({ isActive: true })
      .sort({ price: 1 });
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar membresías', error: error.message });
  }
};

// Obtener membresía por ID
exports.getMembership = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ message: 'Membresía no encontrada' });
    }
    res.json(membership);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener membresía', error: error.message });
  }
};

// Actualizar membresía (admin)
exports.updateMembership = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!membership) {
      return res.status(404).json({ message: 'Membresía no encontrada' });
    }

    res.json({
      message: 'Membresía actualizada exitosamente',
      membership
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar membresía', error: error.message });
  }
};

// Asignar membresía a usuario
exports.assignMembership = async (req, res) => {
  try {
    const { userId, membershipId } = req.body;

    const user = await User.findById(userId);
    const membership = await Membership.findById(membershipId);

    if (!user || !membership) {
      return res.status(404).json({ message: 'Usuario o membresía no encontrada' });
    }

    user.membership = membershipId;
    await user.save();

    res.json({
      message: 'Membresía asignada exitosamente',
      user: {
        id: user._id,
        email: user.email,
        membership: membership
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al asignar membresía', error: error.message });
  }
};

// Obtener estadísticas de membresías (admin)
exports.getMembershipStats = async (req, res) => {
  try {
    const stats = await Membership.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'membership',
          as: 'subscribers'
        }
      },
      {
        $project: {
          name: 1,
          price: 1,
          subscriberCount: { $size: '$subscribers' },
          revenue: { $multiply: ['$price', { $size: '$subscribers' }] }
        }
      }
    ]);

    const totalRevenue = stats.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalSubscribers = stats.reduce((acc, curr) => acc + curr.subscriberCount, 0);

    res.json({
      stats,
      totalRevenue,
      totalSubscribers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
}; 