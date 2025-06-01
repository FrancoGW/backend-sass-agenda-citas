const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');

// Crear nueva cita
exports.createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { businessId, client, service, date } = req.body;

    // Verificar disponibilidad
    const existingAppointment = await Appointment.findOne({
      business: businessId,
      date,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Ya existe una cita en este horario' });
    }

    const appointment = new Appointment({
      business: businessId,
      client,
      service,
      date
    });

    await appointment.save();

    res.status(201).json({
      message: 'Cita creada exitosamente',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear cita', error: error.message });
  }
};

// Listar citas
exports.listAppointments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      startDate, 
      endDate,
      businessId 
    } = req.query;

    const query = {};
    
    if (businessId) query.business = businessId;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const appointments = await Appointment.find(query)
      .populate('business', 'profile.businessName')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al listar citas', error: error.message });
  }
};

// Actualizar estado de cita
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      message: 'Estado de cita actualizado exitosamente',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar cita', error: error.message });
  }
};

// Obtener estadísticas de citas
exports.getAppointmentStats = async (req, res) => {
  try {
    const { businessId, startDate, endDate } = req.query;
    const query = {};

    if (businessId) query.business = businessId;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Appointment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: {
            $sum: '$service.price'
          }
        }
      }
    ]);

    const totalAppointments = stats.reduce((acc, curr) => acc + curr.count, 0);
    const totalRevenue = stats.reduce((acc, curr) => acc + curr.totalRevenue, 0);

    // Estadísticas por día de la semana
    const dailyStats = await Appointment.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      statusStats: stats,
      totalAppointments,
      totalRevenue,
      dailyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

// Verificar disponibilidad
exports.checkAvailability = async (req, res) => {
  try {
    const { businessId, date, serviceDuration } = req.query;
    const startDate = new Date(date);
    const endDate = new Date(startDate.getTime() + serviceDuration * 60000);

    const conflictingAppointments = await Appointment.find({
      business: businessId,
      date: {
        $gte: startDate,
        $lt: endDate
      },
      status: { $in: ['pending', 'confirmed'] }
    });

    res.json({
      available: conflictingAppointments.length === 0,
      conflictingAppointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar disponibilidad', error: error.message });
  }
}; 