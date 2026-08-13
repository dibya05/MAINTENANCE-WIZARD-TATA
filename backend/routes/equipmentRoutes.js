const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const { protect } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/equipment/stats
// @desc    Get aggregate fleet stats (KPIs for FleetOverview)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await Equipment.countDocuments();
    const healthy = await Equipment.countDocuments({ status: 'Healthy' });
    const watch   = await Equipment.countDocuments({ status: 'Watch' });
    const warning = await Equipment.countDocuments({ status: 'Warning' });
    const critical = await Equipment.countDocuments({ status: 'Critical' });

    // Average health score
    const avgResult = await Equipment.aggregate([
      { $group: { _id: null, avg: { $avg: '$healthScore' } } },
    ]);
    const avgHealth = avgResult.length > 0 ? Math.round(avgResult[0].avg) : 0;

    // Stale data: equipment not updated in the last 24 hrs
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stale = await Equipment.countDocuments({ updatedAt: { $lt: oneDayAgo } });

    // Open alerts: Warning + Critical count
    const openAlerts = warning + critical;

    // Most at-risk equipment (for the action table)
    const actionRequired = await Equipment.find({
      status: { $in: ['Warning', 'Critical'] },
    })
      .sort({ healthScore: 1 })
      .limit(10)
      .select('tag name area status healthScore updatedAt');

    res.json({
      total,
      avgHealth,
      openAlerts,
      stale,
      distribution: { healthy, watch, warning, critical },
      actionRequired,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/equipment
// @desc    Get all equipment (supports ?area=&criticality=&search= query params)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const { area, criticality, status, search } = req.query;
    const filter = {};

    if (area && area !== 'all')          filter.area        = area;
    if (criticality && criticality !== 'all') filter.criticality = criticality;
    if (status && status !== 'all')      filter.status      = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tag:  { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
      ];
    }

    const equipment = await Equipment.find(filter).sort({ healthScore: 1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/equipment/:id
// @desc    Get a single piece of equipment by ID
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/equipment
// @desc    Add new equipment
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { name, tag, type, area, criticality, healthScore, manufacturer, installedDate, notes } = req.body;

    const newEquipment = await Equipment.create({
      name, tag, type, area, criticality,
      healthScore: healthScore ?? 100,
      manufacturer, installedDate, notes,
    });

    res.status(201).json(newEquipment);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add equipment', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/equipment/:id
// @desc    Update existing equipment
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const updatedEquipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedEquipment) {
      res.json(updatedEquipment);
    } else {
      res.status(404).json({ message: 'Equipment not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Failed to update equipment', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/equipment/:id
// @desc    Delete equipment
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const deletedEquipment = await Equipment.findByIdAndDelete(req.params.id);

    if (deletedEquipment) {
      res.json({ message: 'Equipment removed successfully' });
    } else {
      res.status(404).json({ message: 'Equipment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
